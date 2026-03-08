// src/core/role/role.service.ts
import prisma from '@/config/database';

class RoleService {
  async create(data: any) {
    const exists = await prisma.role.findUnique({ where: { code: data.name } });
    if (exists) throw new Error('El rol ya existe');

    return prisma.role.create({ data });
  }

  async getAll() {
    return prisma.role.findMany();
  }

  async update(id: string, data: { name: string; code?: string }) {
    return prisma.role.update({ where: { id }, data });
  }

  async remove(id: string) {
    return prisma.role.delete({ where: { id } });
  }

  /**
   * Asignar permisos masivamente a un Rol
   * Reemplaza los permisos anteriores por los nuevos para la vista especificada
   */
  async assignPermissionsToRole(roleId: string, viewCode: string, permissionNames: string[], assignerId: string | undefined) {
    // 1. Validar que la Vista exista
    const view = await prisma.view.findUnique({ where: { code: viewCode } });
    if (!view) throw new Error(`Vista ${viewCode} no encontrada`);

    // 2. Obtener IDs de los permisos permitidos
    const validPermissions = await prisma.permission.findMany({
      where: { name: { in: permissionNames } }
    });

    const validPermissionIds = validPermissions.map(p => p.id);

    // 3. Eliminar permisos anteriores de este Rol para esta Vista
    await prisma.roleViewPermission.deleteMany({
      where: { roleId, viewId: view.id }
    });

    // 4. Crear los nuevos permisos
    if (validPermissionIds.length > 0) {
      const newPermissions = validPermissionIds.map(permissionId => ({
        roleId,
        viewId: view.id,
        permissionId,
        createdBy: assignerId,
      }));

      await prisma.roleViewPermission.createMany({
        data: newPermissions
      });
    }

    return { message: 'Permisos del rol actualizados correctamente' };
  }

  /**
   * Obtiene la matriz completa de Vistas y Permisos para un Rol específico.
   * Útil para renderizar el UI de "Gestión de Acceso Avanzado".
   */
  async getRolePermissions(roleId: string) {
    // 1. Obtener todas las Vistas activas
    const views = await prisma.view.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    // 2. Obtener todos los Permisos activos
    const allPermissions = await prisma.permission.findMany({
      where: { isActive: true }
    });

    // 3. Obtener los permisos asignados actualmente al Rol
    const rolePermissions = await prisma.roleViewPermission.findMany({
      where: { roleId, isActive: true }
    });

    // 4. Mapear para el frontend
    const result = views.map(view => {
      // Filtrar los permisos de este rol para esta vista específica
      const assignedForView = rolePermissions.filter(rp => rp.viewId === view.id);

      // Crear un arreglo de permisos con su estado (asignado o no)
      // O un objeto key-value. Vamos a devolver un array de objetos para que sea más fácil de iterar
      const permissionsList = allPermissions.map(p => {
        return {
          id: p.id,
          name: p.name,
          description: p.description,
          // True si existe el registro de relación
          isAssigned: assignedForView.some(rp => rp.permissionId === p.id)
        };
      });

      return {
        viewId: view.id,
        viewCode: view.code,
        viewName: view.name,
        description: view.description,
        permissions: permissionsList
      };
    });

    return result;
  }
}

export const roleService = new RoleService();
