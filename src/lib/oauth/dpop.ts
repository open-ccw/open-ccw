import { OAUTH_DEVICE_KEY, OAUTH_DPOP_KEY } from '../../routes/oauth/oauthConfig';

interface EcPublicJwk {
  crv: 'P-256';
  kty: 'EC';
  x: string;
  y: string;
}

interface EcPrivateJwk extends EcPublicJwk {
  d: string;
}

function b64url(input: ArrayBuffer | Uint8Array): string {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

async function sha256(input: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
}

let cachedPublicJwk: EcPublicJwk | null = null;

/**
 * 获取（或首次生成）DPoP 签名用 ES256 密钥对。
 * 私钥以 JWK 形式持久化在 localStorage，保证 access token 与密钥绑定关系跨会话有效。
 */
export async function getDpopPrivateKey(): Promise<CryptoKey> {
  const stored = localStorage.getItem(OAUTH_DPOP_KEY);
  if (stored) {
    const jwk = JSON.parse(stored) as EcPrivateJwk;
    cachedPublicJwk = { crv: jwk.crv, kty: jwk.kty, x: jwk.x, y: jwk.y };
    return crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, [
      'sign',
    ]);
  }
  const keyPair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
    'sign',
  ]);
  const jwk = (await crypto.subtle.exportKey('jwk', keyPair.privateKey)) as EcPrivateJwk;
  cachedPublicJwk = { crv: jwk.crv, kty: jwk.kty, x: jwk.x, y: jwk.y };
  localStorage.setItem(OAUTH_DPOP_KEY, JSON.stringify(jwk));
  return keyPair.privateKey;
}

/** DPoP 公钥 JWK（不含私有字段） */
export async function getPublicJwk(): Promise<EcPublicJwk> {
  if (cachedPublicJwk) {
    return cachedPublicJwk;
  }
  await getDpopPrivateKey();
  return cachedPublicJwk!;
}

/** DPoP 公钥指纹（RFC 9449 jkt） */
export async function getJkt(): Promise<string> {
  const jwk = await getPublicJwk();
  return b64url(await sha256(JSON.stringify(jwk)));
}

/** 获取（或首次生成）持久化设备 ID */
export async function getDeviceId(): Promise<string> {
  let deviceId = localStorage.getItem(OAUTH_DEVICE_KEY);
  if (!deviceId) {
    deviceId = b64url(crypto.getRandomValues(new Uint8Array(32)));
    localStorage.setItem(OAUTH_DEVICE_KEY, deviceId);
  }
  return deviceId;
}

/**
 * 生成 DPoP proof JWT（RFC 9449）。
 * @param htm HTTP 方法
 * @param htu 目标 URL（不含 query）
 * @param accessToken 可选，绑定 access token 时附加 ath 声明
 */
export async function createDpopProof(
  htm: string,
  htu: string,
  accessToken?: string,
): Promise<string> {
  const parsed = new URL(htu);
  const publicJwk = await getPublicJwk();
  const header = { typ: 'dpop+jwt', alg: 'ES256', jwk: publicJwk };
  const payload: Record<string, unknown> = {
    jti: b64url(crypto.getRandomValues(new Uint8Array(16))),
    htm: htm.toUpperCase(),
    htu: `${parsed.origin}${parsed.pathname}`,
    iat: Math.floor(Date.now() / 1000),
  };
  if (accessToken) {
    payload.ath = b64url(await sha256(accessToken));
  }
  const signingInput = `${b64url(new TextEncoder().encode(JSON.stringify(header)))}.${b64url(new TextEncoder().encode(JSON.stringify(payload)))}`;
  const privateKey = await getDpopPrivateKey();
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    new TextEncoder().encode(signingInput),
  );
  return `${signingInput}.${b64url(signature)}`;
}
