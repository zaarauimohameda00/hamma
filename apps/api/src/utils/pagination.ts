export function parsePagination(query: Record<string, unknown>) {
  const page = Math.max(1, Number(query.page ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize ?? 20)));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { page, pageSize, from, to };
}

export function parseSort(
  query: Record<string, unknown>,
  allowed: string[],
  defaultSort: string
): { column: string; ascending: boolean } {
  const sort = String(query.sort ?? defaultSort);
  const parts = sort.split(':');
  const defaultParts = defaultSort.split(':');
  const rawColumn = parts[0] || defaultParts[0] || allowed[0] || 'created_at';
  const rawDir = (parts[1] || defaultParts[1] || 'desc').toLowerCase();
  const column = allowed.includes(rawColumn) ? rawColumn : (allowed[0] || 'created_at');
  const ascending = rawDir !== 'desc';
  return { column, ascending };
}