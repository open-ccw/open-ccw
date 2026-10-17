import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SSO_ORIGIN } from '../../../oauth/oauthConfig';

const ALLOWED_PATHS = new Set(['/oauth/v2/par', '/oauth/v2/token', '/oauth/v2/revoke']);

/**
 * 转发 OAuth 表单请求到 sso.ccw.site。
 * 浏览器直接请求 sso.ccw.site 会触发 CORS 预检，故经此代理；
 * DPoP proof 由客户端按真实上游 URL 签名，此处原样转发头与请求体。
 */
export const POST: RequestHandler = async ({ request, params }) => {
  const upstream = new URL(request.headers.get('X-Upstream-Url') ?? '');
  if (
    upstream.origin !== SSO_ORIGIN ||
    !ALLOWED_PATHS.has(upstream.pathname) ||
    upstream.pathname !== `/oauth/v2/${params.endpoint}`
  ) {
    return error(400, 'invalid upstream url');
  }
  const dpop = request.headers.get('DPoP');
  if (!dpop) {
    return error(400, 'missing DPoP proof');
  }
  const response = await fetch(upstream, {
    method: 'POST',
    headers: {
      'Content-Type': request.headers.get('Content-Type') ?? 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      DPoP: dpop,
    },
    body: await request.text(),
  });
  return new Response(response.body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') ?? 'application/json',
      'Cache-Control': 'no-store',
    },
  });
};
