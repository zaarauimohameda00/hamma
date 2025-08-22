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
  const [rawColumn, rawDir] = sort.split(':');
  const fallbackParts = defaultSort.split(':');
  const column = allowed.includes(rawColumn) ? rawColumn : fallbackParts[0] ?? allowed[0] ?? 'created_at';
  const dir = (rawDir ?? fallbackParts[1] ?? 'desc').toLowerCase();
  const ascending = dir !== 'desc';
  return { column, ascending };
}