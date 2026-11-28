import { sealedRequest, SERVER_PUB_KEYS } from '#lib/crypto/sealedRequest.ts';

const LOGIN_API = 'https://openccw.seia0070.dpdns.org/login';

interface LoginResult {
  code?: string;
  token?: string;
}

/**
 * 通过登录服务换取 token。
 * @param uid 账号
 * @param password 密码
 * @param send 可选的自定义传输层，返回上游原始响应文本（如经主站代理转发）
 * @returns access token
 */
export async function loginAccount(
  uid: string,
  password: string,
  send?: (body: string) => Promise<string>,
): Promise<string> {
  const result = await sealedRequest<LoginResult>(
    SERVER_PUB_KEYS,
    LOGIN_API,
    {
      uid,
      password,
    },
    send,
  );
  if (result.code !== '200' || !result.token) {
    const code = result.code;
    if (code === '400' || code === '401') {
      throw new Error('账号或密码错误');
    }
    throw new Error(code ? `登录失败 ${code} ` : '登录失败');
  }
  return result.token;
}
