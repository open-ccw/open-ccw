import { browser, dev } from '$app/env';
import { updateToken, clearTokenAndUser } from '#lib/user/userStore.ts';
import { loginAccount } from '#lib/auth/loginApi.ts';
import { toast } from '#lib';

/** 主站地址：预览域名经主站中转登录请求，规避第三方登录服务的跨域限制 */
const MAIN_ORIGIN = 'https://ccw.kivotos.qzz.io';

/** 预览环境域名后缀（Cloudflare 预览构建） */
const PREVIEW_SUFFIXES = ['.oc.schale.qzz.io', '.dev.openccw.dpdns.org', '.workers.dev'];

/** 当前会话是否来自开发临时 token：为 true 时禁用 refresh 续期 */
let devTokenSession = false;

/** 当前是否为开发临时 token 会话（不获取也不刷新 refresh token） */
export function isDevTokenSession(): boolean {
  return devTokenSession;
}

/** 判断主机是否属于开发或 preview 环境 */
export function isDevPreviewHost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.lvh.me') ||
    PREVIEW_SUFFIXES.some((suffix) => hostname.endsWith(suffix))
  );
}

/** 经主站中转向登录服务换 token，只取 access token，不涉及 refresh */
async function loginViaMain(uid: string, password: string): Promise<string> {
  const endpoint = new URL('/api/dev-token', MAIN_ORIGIN);
  return loginAccount(uid, password, async (body) => {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    return res.text();
  });
}

/**
 * 读取 URL 中的开发临时 token 并完成登录。
 * 支持 `?dev_token=<access token>` 直接注入，或 `?dev_uid=<账号>&dev_pw=<密码>`
 * 让主站中转登录服务换取 token；仅在开发/preview 环境生效，
 * 成功后立即从地址栏移除参数，避免凭据残留在历史记录中。
 *
 * @returns 是否成功应用了临时 token
 */
export async function applyDevTokenFromUrl(): Promise<boolean> {
  if (!browser || !(dev || isDevPreviewHost(location.hostname))) {
    return false;
  }
  const url = new URL(location.href);
  const directToken = url.searchParams.get('dev_token');
  const uid = url.searchParams.get('dev_uid');
  const password = url.searchParams.get('dev_pw');
  if (!directToken && !(uid && password)) {
    return false;
  }

  try {
    let accessToken = directToken;
    if (!accessToken && uid && password) {
      accessToken = await loginViaMain(uid, password);
    }
    if (!accessToken) {
      throw new Error('缺少账号或密码');
    }
    devTokenSession = true;
    await updateToken(accessToken);
    url.searchParams.delete('dev_token');
    url.searchParams.delete('dev_uid');
    url.searchParams.delete('dev_pw');
    history.replaceState(history.state, '', url);
    toast.info('已使用开发临时 Token 登录，该会话不会自动续期');
    return true;
  } catch (e) {
    devTokenSession = false;
    // token 无效时 updateToken 已写入内存但拉取用户失败，这里回滚避免留下半登录状态
    clearTokenAndUser();
    toast.error(`开发临时 Token 获取失败：${e instanceof Error ? e.message : String(e)}`);
    return false;
  }
}
