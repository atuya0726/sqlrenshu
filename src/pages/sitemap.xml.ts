import { questions } from '@/questions/catalog';
import { sqlTopics } from '@/data/sqlTopics';
import { postgresqlFeatures } from '@/data/postgresqlFeatures';

export const prerender = true;

// lastmod は内容を実際に変えた日だけを書く。ビルド日を入れると、検索エンジンに信用されなくなる。
// 2026-11-13 に全ページを新版へ入れ替えたので、これを既定にする。
// それ以降に内容を変えたページは、パスと日付をここへ足す。
const DEFAULT_LASTMOD = '2026-11-13';
const updatedPaths: Record<string, string> = {
  '/sql/left-join/': '2026-11-19',
  '/postgresql/returning/': '2026-11-19',
  '/postgresql/on-conflict/': '2026-11-19',
  // 2026-11-21: CREATE TABLE のガイドと演習8問を追加（一覧ページにも項目が増えた）。
  '/sql/': '2026-11-21',
  '/practice/': '2026-11-21',
  '/sql/create-table/': '2026-11-21',
  '/practice/create-table/': '2026-11-21',
  ...Object.fromEntries(Array.from({ length: 8 }, (_, index) => [`/practice/create-table/create-table-0${index + 1}/`, '2026-11-21'])),
};

export function GET({ site }: { site?: URL }) {
  const origin = site ?? new URL('https://sqlrenshu.com');
  const paths = [
    '/', '/practice/', '/postgresql/', '/sql/', '/about/', '/privacy/', '/contact/',
    ...sqlTopics.map((topic) => `/sql/${topic.slug}/`),
    ...new Set(questions.map((question) => `/practice/${question.category}/`)),
    ...questions.map((question) => `/practice/${question.category}/${question.id}/`),
    ...postgresqlFeatures.map((feature) => `/postgresql/${feature.slug}/`),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((path) => `  <url><loc>${new URL(path, origin)}</loc><lastmod>${updatedPaths[path] ?? DEFAULT_LASTMOD}</lastmod></url>`).join('\n')}\n</urlset>`;
  return new Response(body, { headers:{ 'Content-Type':'application/xml; charset=utf-8' } });
}
