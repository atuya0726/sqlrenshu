import { questions } from '@/questions/catalog';
import { sqlTopics } from '@/data/sqlTopics';
import { postgresqlFeatures } from '@/data/postgresqlFeatures';

export const prerender = true;

export function GET({ site }: { site?: URL }) {
  const origin = site ?? new URL('https://sqlrenshu.com');
  const paths = [
    '/', '/practice/', '/postgresql/', '/sql/', '/about/', '/privacy/', '/contact/',
    ...sqlTopics.map((topic) => `/sql/${topic.slug}/`),
    ...new Set(questions.map((question) => `/practice/${question.category}/`)),
    ...questions.map((question) => `/practice/${question.category}/${question.id}/`),
    ...postgresqlFeatures.map((feature) => `/postgresql/${feature.slug}/`),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((path) => `  <url><loc>${new URL(path, origin)}</loc></url>`).join('\n')}\n</urlset>`;
  return new Response(body, { headers:{ 'Content-Type':'application/xml; charset=utf-8' } });
}
