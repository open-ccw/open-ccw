export interface ServerPubKeys {
  // X25519 公钥
  x25519: string;
  // Ed25519 公钥
  ed25519: string;
}

export const SERVER_PUB_KEYS: ServerPubKeys = {
  x25519: "U89lseodU1rnbg7d1wF2s7ZMIfpVGPvNGR72RYnaXmU",
  ed25519: "iiHGyfBnh45NRn78o7tT6mvNxM7DzT_yyX4yBdNJIKg",
};

const te = new TextEncoder();
const td = new TextDecoder();

const b64url = (b: Uint8Array): string => {
  let s = "";
  for (let i = 0; i < b.length; i += 0x8000)
    s += String.fromCharCode(...b.subarray(i, i + 0x8000));
  return btoa(s).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
};

const unb64 = (s: string): Uint8Array<ArrayBuffer> => {
  const t = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(t + "=".repeat((4 - (t.length % 4)) % 4));
  const o = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) o[i] = bin.charCodeAt(i);
  return o;
};

const concat = (a: Uint8Array, b: Uint8Array): Uint8Array<ArrayBuffer> => {
  const o = new Uint8Array(a.length + b.length);
  o.set(a, 0);
  o.set(b, a.length);
  return o;
};

const SALT = te.encode("ccw1") as Uint8Array<ArrayBuffer>;

const hkdf = (
  ikm: ArrayBuffer,
  len: number,
  info: Uint8Array<ArrayBuffer>,
): Promise<ArrayBuffer> =>
  crypto.subtle
    .importKey("raw", ikm, { name: "HKDF" }, false, ["deriveBits"])
    .then((k) =>
      crypto.subtle.deriveBits(
        { name: "HKDF", hash: "SHA-256", salt: SALT, info },
        k,
        len * 8,
      ),
    );

export async function sealedRequest<T = Record<string, unknown>>(
  keys: ServerPubKeys,
  url: string,
  payload: Record<string, unknown>,
): Promise<T> {
  const eph = (await crypto.subtle.generateKey({ name: "X25519" }, true, [
    "deriveBits",
  ])) as CryptoKeyPair;
  const ephPub = new Uint8Array(
    await crypto.subtle.exportKey("raw", eph.publicKey),
  );

  const srvPub = await crypto.subtle.importKey(
    "raw",
    unb64(keys.x25519),
    { name: "X25519" },
    false,
    [],
  );
  const secret = await crypto.subtle.deriveBits(
    { name: "X25519", public: srvPub },
    eph.privateKey,
    256,
  );

  const reqKey = await hkdf(secret, 16, te.encode("req"));
  const aes = await crypto.subtle.importKey(
    "raw",
    reqKey,
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: nonce },
      aes,
      te.encode(JSON.stringify(payload)),
    ),
  );

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      k: b64url(ephPub),
      n: b64url(nonce),
      c: b64url(ct),
    }),
  });
  const body = JSON.parse(await res.text()) as Record<string, unknown> & {
    n?: string;
    c?: string;
    s?: string;
  };

  if (
    typeof body.c !== "string" ||
    typeof body.n !== "string" ||
    typeof body.s !== "string"
  ) {
    throw new Error(String(body.code ?? "请求失败" + res.status));
  }

  const srvEd = await crypto.subtle.importKey(
    "raw",
    unb64(keys.ed25519),
    { name: "Ed25519" },
    false,
    ["verify"],
  );
  const ok = await crypto.subtle.verify(
    "Ed25519",
    srvEd,
    unb64(body.s),
    concat(unb64(body.n), unb64(body.c)),
  );
  if (!ok) throw new Error("签名校验失败");

  const respKey = await hkdf(secret, 16, te.encode("resp"));
  const rAes = await crypto.subtle.importKey(
    "raw",
    respKey,
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: unb64(body.n) },
    rAes,
    unb64(body.c),
  );
  return JSON.parse(td.decode(plain)) as T;
}
