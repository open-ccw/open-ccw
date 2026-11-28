import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/** 登录服务端点，仅在该服务与预览域名之间存在跨域限制时才需要经此中转 */
const LOGIN_ENDPOINT = 'https://openccw.seia0070.dpdns.org/login';

/** 密封请求体大小上限，防止被当作通用转发入口滥用 */
const MAX_BODY_BYTES = 8 * 1024;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
} as const;

/** 预检请求：开发/preview 域名跨域调用本端点时放行 */
export const OPTIONS: RequestHandler = () =>
  new Response(null, { status: 204, headers: CORS_HEADERS });

/**
 * 开发/preview 环境的临时 token 中转。
 * 请求体是客户端用登录服务公钥生成的密封密文，本端点原样转发、不解密也不落盘，
 * 响应原样带回给客户端自行校验与解密；不涉及任何 refresh token。
 */
export const POST: RequestHandler = async ({ request, setHeaders }) => {
  const body = await request.text();
  if (!body || body.length > MAX_BODY_BYTES) {
    return error(400, '请求体不合法');
  }

  let upstream: Response;
  try {
    upstream = await fetch(LOGIN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
  } catch (e) {
    return error(502, `登录服务不可用：${e instanceof Error ? e.message : String(e)}`);
  }

  setHeaders({ 'Cache-Control': 'no-store' });
  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
};
