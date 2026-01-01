export const buildPrismaFilters = (query: Record<string, any>) => {
  const filters: Record<string, any> = {};

  for (const key in query) {
    const value = query[key];
    if (value === undefined || value === '') continue;

    // Soporte para filtros anidados: person.lastName
    if (key.includes('.')) {
      const [relation, field] = key.split('.');
      filters[relation] = filters[relation] || {};
      if (value === 'true' || value === 'false') {
        filters[relation][field] = value === 'true';
      } else if (!isNaN(Number(value))) {
        filters[relation][field] = Number(value);
      } else {
        filters[relation][field] = {
          contains: String(value),
          mode: 'insensitive',
        };
      }
    } else {
      if (value === 'true' || value === 'false') {
        filters[key] = value === 'true';
      } else if (!isNaN(Number(value))) {
        filters[key] = Number(value);
      } else {
        filters[key] = {
          contains: String(value),
          mode: 'insensitive',
        };
      }
    }
  }

  return filters;
};

export const buildPagination = (query: Record<string, any>) => {
  let page = parseInt(query.page as string) || 1;
  let limit = parseInt(query.limit as string) || 10;
  const warnings: string[] = [];
  
  if (isNaN(page) || page < 1) {
    warnings.push('Page inválido. Se ajustó a 1.');
    page = 1;
  }

  if (isNaN(limit) || limit < 1) {
    warnings.push('Limit inválido. Se ajustó a 10.');
    limit = 10;
  } else if (limit > 100) {
    warnings.push('Limit excede el máximo permitido (100). Se ajustó a 100.');
    limit = 100;
  }

  const skip = (page - 1) * limit;

  return { skip, take: limit, page, limit, warnings };
};