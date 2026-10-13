import CryptoJS from "crypto-js";
import { communityWeb } from "#lib/api";
import { browser } from "$app/environment";
import type OSS from "ali-oss";

let OSS_lib: typeof OSS;

type OssRes = {
  accessKeyId: string;
  securityToken: string;
  accessKeySecret: string;
};

async function getOssToken(oid: string) {
  const { data } = await communityWeb.getCcwMainStatus();
  const iv = CryptoJS.enc.Utf8.parse(oid.substring(0, 16));
  const key = CryptoJS.enc.Utf8.parse(oid.substring(8));
  const decrypted = CryptoJS.AES.decrypt(data, key, { iv });
  const dat: OssRes = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  const { accessKeyId, securityToken, accessKeySecret } = dat;
  return { accessKeyId, accessKeySecret, stsToken: securityToken };
}

let oss: OSS | null = null;

export async function getOSS(oid: string): Promise<OSS> {
  if (browser) {
    OSS_lib = await import("ali-oss").then((res) => res.default);
  }
  if (!OSS_lib) {
    return null as unknown as OSS;
  }
  if (!oss) {
    const { accessKeyId, accessKeySecret, stsToken } = await getOssToken(oid);
    oss = new OSS_lib({
      refreshSTSToken: () => {
        return getOssToken(oid);
      },
      accessKeyId,
      accessKeySecret,
      stsToken,
      bucket: "zhishi",
      region: "oss-cn-beijing",
    });
  }
  return oss;
}
