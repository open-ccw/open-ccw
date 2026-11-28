import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { loginAccount } from '#lib/auth/loginApi';

/** 只有主站可以签发临时 token，预览域名不复制该能力 */
const MAIN_HOST = 'ccw.kivotos.qzz.io';

/** 端点所需的运行时变量（Workers Secret） */
interface DevTokenEnv {
  DEV_TOKEN_KEY?: string;
  DEV_ACCOUNT_UID?: string;
  DEV_ACCOUNT_PASSWORD?: string;
}

/** 定长比较，避免通过响应时间推测密钥 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * 开发/preview 环境的临时 token 端点。
 * 用共享密钥换取一个仅含 access token 的登录态（不含 refresh token，不可续期）。
 * 未配置 DEV_TOKEN_KEY 或非主站访问时一律返回 404，避免暴露端点存在性。
 */
export const GET: RequestHandler = async ({ url, platform, setHeaders }) => {
  const env = (platform?.env ?? {}) as DevTokenEnv;
  const expectedKey = env.DEV_TOKEN_KEY;
  const uid = env.DEV_ACCOUNT_UID;
  const password = env.DEV_ACCOUNT_PASSWORD;

  if (url.host !== MAIN_HOST || !expectedKey || !uid || !password) {
    return error(404, 'Not found');
  }

  const key = url.searchParams.get('key') ?? '';
  if (!safeEqual(key, expectedKey)) {
    return error(403, '密钥无效');
  }

  let accessToken: string;
  try {
    accessToken = await loginAccount(uid, password);
  } catch (e) {
    return error(502, `临时 token 获取失败：${e instanceof Error ? e.message : String(e)}`);
  }

  setHeaders({ 'Cache-Control': 'no-store' });
  return Response.json({ token: accessToken });
};
