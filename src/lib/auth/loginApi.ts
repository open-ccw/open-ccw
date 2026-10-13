import { sealedRequest, SERVER_PUB_KEYS } from "#lib/crypto/sealedRequest";

const LOGIN_API = "https://openccw.seia0070.dpdns.org/login";

interface LoginResult {
  code?: string;
  token?: string;
}

export async function loginAccount(uid: string, password: string): Promise<string> {
  const result = await sealedRequest<LoginResult>(SERVER_PUB_KEYS, LOGIN_API, {
    uid,
    password,
  });
  if (result.code !== "200" || !result.token) {
    const code = result.code;
    if (code === "400" || code === "401") {
      throw new Error("账号或密码错误");
    }
    throw new Error(code ? `登录失败 ${code} ` : "登录失败");
  }
  return result.token;
}
