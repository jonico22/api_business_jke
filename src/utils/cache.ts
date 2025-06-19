import NodeCache from 'node-cache';

export const cache = new NodeCache({
  stdTTL: 300, // segundos (5 minutos)
  checkperiod: 120, // limpia expirados cada 2 min
});

export const clearRolePermissionCache = (roleId: string) => {
  const keys = cache.keys().filter(key => key.startsWith(`${roleId}_`));
  keys.forEach(key => cache.del(key));
};