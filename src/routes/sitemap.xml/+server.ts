import type { RequestHandler } from './$types';

/** sitemap 收录的页面路径，与 hooks.server.ts 的 SITEMAP_ROUTES 保持一致 */
const SITEMAP_PATHS: readonly string[] = [
  '/',
  '/notice',
  '/notice/interaction',
  '/notice/reply',
  '/notice/share',
  '/notice/system',
  '/register',
  '/search',
  '/oauth',
  '/oauth/callback',
  '/settings/auth',
];

/**
 * 动态生成 sitemap.xml：以请求域名为基准输出 URL，
 * 使主站与镜像站（openccw.dpdns.org 等）各自拿到正确域名的 sitemap。
 */
export const GET: RequestHandler = ({ url }) => {
  const lastmod = '2026-11-07';
  const entries = SITEMAP_PATHS.map(
    (path) =>
      `  <url>\n    <loc>https://${url.host}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`,
  ).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
  return new Response(xml, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
    },
  });
};
