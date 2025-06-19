import prisma from '../config/database';

export const hasCombinedPermission = async (
  userId: string,
  viewName: string,
  permissionName: string
): Promise<boolean> => {
  // ✅ Permiso asignado directamente al usuario
  const direct = await prisma.userViewPermission.findFirst({
    where: {
      userId,
      view: { name: viewName },
      permission: { name: permissionName },
    },
  });

  if (direct) return true;

  // ✅ Permiso obtenido por el rol del usuario
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          roleViewPermissions: {
            where: {
              view: { name: viewName },
              permission: { name: permissionName },
            },
          },
        },
      },
    },
  });

  return !!user?.role?.roleViewPermissions.length;
};
