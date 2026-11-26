import { questions } from '@/questions/catalog';
import { sqlTopics } from '@/data/sqlTopics';
import { postgresqlFeatures } from '@/data/postgresqlFeatures';

export const prerender = true;

// lastmod は内容を実際に変えた日だけを書く。ビルド日を入れると、検索エンジンに信用されなくなる。
// 2026-11-13 に全ページを新版へ入れ替えたので、これを既定にする。
// それ以降に内容を変えたページは、パスと日付をここへ足す。
const DEFAULT_LASTMOD = '2026-11-13';
// 11/26 に静的な表を追加した問題の範囲を固定し、将来追加するページに過去の日付を付けない。
const practiceAtRevision: [number, string[]][] = [
  [6, ['date-filter', 'date-trunc', 'delete', 'exists', 'insert', 'intersect-except', 'like', 'order-by', 'select', 'string-functions', 'union', 'update', 'with']],
  [7, ['cast', 'cross-join', 'delete-using', 'full-outer-join', 'insert-select', 'limit-offset', 'nullif', 'update-from']],
  [8, ['any-all', 'correlated-subquery', 'create-table', 'date-arithmetic', 'distinct', 'generate-series', 'having', 'is-distinct-from', 'join', 'jsonb', 'lag-lead', 'merge', 'not-in', 'ntile', 'percentile-cont', 'regexp', 'rollup', 'self-join', 'string-agg', 'subquery', 'where', 'window-frame', 'with-recursive']],
  [9, ['array', 'case']],
  [10, ['alter-table', 'coalesce']],
  [11, ['window-functions']],
  [12, ['group-by']],
];
const revisedOnNov26 = [
  '/', '/about/', '/sql/', '/practice/', '/practice/alter-table/',
  ...practiceAtRevision.flatMap(([count, categories]) => categories.flatMap((category) =>
    Array.from({ length: count }, (_, i) => `/practice/${category}/${category}-${String(i + 1).padStart(2, '0')}/`))),
  ...[
    'alter-table', 'any-all', 'array', 'case', 'cast', 'coalesce', 'correlated-subquery', 'create-table',
    'cross-join', 'date-arithmetic', 'date-filter', 'date-trunc', 'delete', 'delete-using', 'distinct', 'exists',
    'full-outer-join', 'generate-series', 'group-by', 'having', 'inner-join', 'insert', 'insert-select', 'intersect-except',
    'is-distinct-from', 'jsonb', 'lag-lead', 'left-join', 'like', 'limit-offset', 'merge', 'not-in',
    'ntile', 'nullif', 'order-by', 'percentile-cont', 'regexp', 'rollup', 'select', 'self-join',
    'string-agg', 'string-functions', 'subquery', 'union', 'update', 'update-from', 'where', 'window-frame',
    'window-functions', 'with', 'with-recursive',
  ].map((slug) => `/sql/${slug}/`),
  ...['distinct-on', 'filter', 'lateral', 'on-conflict', 'returning'].map((slug) => `/postgresql/${slug}/`),
];
const updatedPaths: Record<string, string> = {
  '/practice/create-table/': '2026-11-21',
  '/practice/distinct/': '2026-11-21',
  ...Object.fromEntries(revisedOnNov26.map((path) => [path, '2026-11-26'])),
};

export function lastModified(path: string) {
  return updatedPaths[path] ?? DEFAULT_LASTMOD;
}

export function GET({ site }: { site?: URL }) {
  const origin = site ?? new URL('https://sqlrenshu.com');
  const paths = [
    '/', '/practice/', '/postgresql/', '/sql/', '/about/', '/privacy/', '/contact/',
    ...sqlTopics.map((topic) => `/sql/${topic.slug}/`),
    ...new Set(questions.map((question) => `/practice/${question.category}/`)),
    ...questions.map((question) => `/practice/${question.category}/${question.id}/`),
    ...postgresqlFeatures.map((feature) => `/postgresql/${feature.slug}/`),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((path) => `  <url><loc>${new URL(path, origin)}</loc><lastmod>${lastModified(path)}</lastmod></url>`).join('\n')}\n</urlset>`;
  return new Response(body, { headers:{ 'Content-Type':'application/xml; charset=utf-8' } });
}
