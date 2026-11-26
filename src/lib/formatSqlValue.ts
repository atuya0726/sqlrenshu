export function formatSqlValue(value: unknown): string {
  if (value === null) return 'NULL';
  if (value === '') return "''（空文字）";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (Array.isArray(value)) {
    return `{${value.map((item) => item === null ? 'NULL' : typeof item === 'object' ? JSON.stringify(item) : String(item)).join(',')}}`;
  }
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}
