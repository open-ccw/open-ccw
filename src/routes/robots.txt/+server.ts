import type { RequestHandler } from './$types';

/**
 * 动态生成 robots.txt：Sitemap 指向当前请求域名，
 * 保证主站与镜像站各自引用自己的 sitemap 地址。
 */
export const GET: RequestHandler = ({ url }) => {
  const body = `User-agent: *\nAllow: /\n\nSitemap: https://${url.host}/sitemap.xml\n`;
  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
    },
  });
};
