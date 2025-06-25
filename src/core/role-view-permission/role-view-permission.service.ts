// src/core/role_view_permission/role-view-permission.service.ts
import prisma from '@/config/database';
import {cache, clearRolePermissionCache } from '@/utils/cache';


class RoleViewPermissionService {
  async assign(data: { roleId: string; viewId: string; permissionId: string }) {

    const { roleId, viewId, permissionId } = data;
    const existing = await prisma.roleViewPermission.findFirst({
      where: { roleId, viewId, permissionId },
    });

    if (existing) throw new Error( 'Ya existe la asignación');
    const result = await prisma.roleViewPermission.create({ data });
    cache.del('role_view_permissions');
    clearRolePermissionCache(roleId);
    return result;
  }

  async getAll() {
    const cached = cache.get('role_view_permissions');
    if (cached) return cached;

    const result = await prisma.roleViewPermission.findMany({
      include: {
        role: true,
        view: true,
        permission: true,
      },
    });
    cache.set('role_view_permissions', result);
    return result;
  }

  async remove(id: string) {
    const result = await prisma.roleViewPermission.delete({ where: { id } });
    cache.del('role_view_permissions');
    return result;
  }
  async getPermissionsByRole(roleId: string) {
    const cached = cache.get(`permissions_by_role_${roleId}`);
    if (cached) return cached;

    const result = await prisma.roleViewPermission.findMany({
      where: { roleId },
      include: {
        view: true,
        permission: true,
      },
    });

    const grouped = result.reduce((acc: any, curr) => {
      const view = curr.view.name;
      if (!acc[view]) acc[view] = [];
      acc[view].push(curr.permission);
      return acc;
    }, {});

    cache.set(`permissions_by_role_${roleId}`, grouped);
    return grouped;
  }
  async checkRolePermission(roleId: string, viewName: string, permissionName: string) {
    const cached = cache.get(`role_permission_${roleId}_${viewName}_${permissionName}`);
    if (cached !== undefined) return cached;

    const result = await prisma.roleViewPermission.findFirst({
      where: {
        roleId,
        view: { name: viewName },
        permission: { name: permissionName },
      },
    });

    const hasPermission = !!result;
    cache.set(`role_permission_${roleId}_${viewName}_${permissionName}`, hasPermission);
    return hasPermission;
  }
  async getViewsByRole(roleId: string) {
    const cached = cache.get(`views_by_role_${roleId}`);
    if (cached) return cached;

    const permissions = await prisma.roleViewPermission.findMany({
      where: { roleId },
      include: { view: true },
    });

    const views = [...new Map(permissions.map(p => [p.view.id, p.view])).values()];
    cache.set(`views_by_role_${roleId}`, views);
    return views;
  }
  async removeAllRolePermissionsFromView(roleId: string, viewId: string) {
    const deleted = await prisma.roleViewPermission.deleteMany({
      where: {
        roleId,
        viewId,
      },
    });
    clearRolePermissionCache(roleId);
    return { message: 'Permisos eliminados', count: deleted.count };
  }
}

export const roleViewPermissionService = new RoleViewPermissionService();
