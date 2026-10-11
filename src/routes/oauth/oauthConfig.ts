/** CCW OAuth (sso.ccw.site) 配置常量 */

export const SSO_ORIGIN = "https://sso.ccw.site";
export const OAUTH_CLIENT_ID = "gandi-desktop-v2";
export const STEP_UP_URL = "https://www.ccw.site/oauth/step-up";
export const OAUTH_SCOPE = "gandi.api profile offline_access";

/**
 * PAR/换 token 使用的回调地址。
 * SSO 的 gandi-desktop-v2 客户端白名单仅允许 loopback（任意端口，字符串精确匹配），
 * 故固定使用此地址；浏览器最终会跳到该地址（无服务监听），
 * 由用户手动复制地址栏 URL 回本站粘贴完成登录。
 */
export const OAUTH_REDIRECT_URI = "http://127.0.0.1:7777/oauth/callback";

/** sso.ccw.site 上的 OAuth 端点 */
export const OAUTH_ENDPOINTS = {
  par: `${SSO_ORIGIN}/oauth/v2/par`,
  authorize: `${SSO_ORIGIN}/oauth/v2/authorize`,
  token: `${SSO_ORIGIN}/oauth/v2/token`,
  revoke: `${SSO_ORIGIN}/oauth/v2/revoke`,
} as const;

/** 本站代理端点（转发 DPoP 头到 sso.ccw.site，规避浏览器 CORS 预检） */
export const OAUTH_PROXY_ENDPOINTS = {
  par: "/oauth/sso/par",
  token: "/oauth/sso/token",
  revoke: "/oauth/sso/revoke",
} as const;

/** sessionStorage 键：授权成功后暂存的 refresh 记录（供注册页绑定账号） */
export const OAUTH_PENDING_REFRESH_KEY = "oc_oauth_refresh";

/** localStorage 键：DPoP 设备 ID */
export const OAUTH_DEVICE_KEY = "oc_oauth_device_id";
/** localStorage 键：DPoP 私钥 JWK */
export const OAUTH_DPOP_KEY = "oc_oauth_dpop_key";

const OAUTH_STATE_KEY = "oc_oauth_state";
const OAUTH_VERIFIER_KEY = "oc_oauth_verifier";

/** 待完成授权的 state 与 PKCE code_verifier */
export interface OauthPendingAuth {
  state: string;
  verifier: string;
}

/** 保存 state 与 code_verifier（localStorage，跨标签页可读，兼容新标签页授权） */
export function setOauthPendingAuth(state: string, verifier: string): void {
  localStorage.setItem(OAUTH_STATE_KEY, state);
  localStorage.setItem(OAUTH_VERIFIER_KEY, verifier);
}

/** 读取已保存的 state 与 code_verifier */
export function getOauthPendingAuth(): OauthPendingAuth | null {
  if (typeof window === "undefined") {
    return null;
  }
  const state = localStorage.getItem(OAUTH_STATE_KEY);
  const verifier = localStorage.getItem(OAUTH_VERIFIER_KEY);
  return state && verifier ? { state, verifier } : null;
}

/** 授权完成后清除 state 与 code_verifier */
export function clearOauthPendingAuth(): void {
  localStorage.removeItem(OAUTH_STATE_KEY);
  localStorage.removeItem(OAUTH_VERIFIER_KEY);
}
