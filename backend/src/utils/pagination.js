export function getPagination(query, defaultLimit = 200, maxLimit = 200) {
  const isPaginated = query.page !== undefined || query.limit !== undefined;
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  const skip = (page - 1) * limit;

  return { isPaginated, page, limit, skip };
}

