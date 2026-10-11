/** CCW OAuth (sso.ccw.site) 配置常量 */

export const SSO_ORIGIN = "https://sso.ccw.site";
export const OAUTH_CLIENT_ID = "gandi-desktop-v2";
export const STEP_UP_URL = "https://www.ccw.site/oauth/step-up";
export const OAUTH_SCOPE = "gandi.api profile offline_access";

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

/** 本站 OAuth 回调地址 */
export function oauthCallbackUrl(): string {
  return new URL("/oauth/callback", location.origin).toString();
}

/** sessionStorage 键：授权请求 state */
export const OAUTH_STATE_KEY = "oc_oauth_state";
/** sessionStorage 键：PKCE code_verifier */
export const OAUTH_VERIFIER_KEY = "oc_oauth_verifier";
/** localStorage 键：DPoP 设备 ID */
export const OAUTH_DEVICE_KEY = "oc_oauth_device_id";
/** localStorage 键：DPoP 私钥 JWK */
export const OAUTH_DPOP_KEY = "oc_oauth_dpop_key";
