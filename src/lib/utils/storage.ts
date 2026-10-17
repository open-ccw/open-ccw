import { md5 } from 'js-md5';
import { communityWeb } from '#lib/api.ts';

/**
 * 存储用途（与 `communityWeb.getStoragePostPolicy` 的 `StoragePurpose` 一致）
 * - `PROJECT_ASSET` / `PROJECT_SB3`：必须传 `projectOid`
 * - 其余用途 `projectOid` 可选
 */
type StoragePurpose =
  | 'APPLICATION_ASSET'
  | 'BACKPACK_ASSET'
  | 'CREATOR_COLLEGE_COVER_IMAGE'
  | 'CREATOR_COLLEGE_EDITOR_IMAGE'
  | 'PROJECT_ASSET'
  | 'PROJECT_SB3'
  | 'SPINE_ASSET'
  | 'USER_CONFIG'
  | 'WORK_COVER';

/**
 * 计算文件内容的 MD5 哈希（十六进制字符串）
 * @param file 待哈希的文件
 * @returns MD5 十六进制字符串
 */
export async function fileMd5(file: File): Promise<string> {
  return md5(await file.arrayBuffer());
}

/**
 * 通过加载图片探测文件是否真实存在（`<img>` 加载不受 CORS 限制）
 * @param url 待探测的文件地址
 * @returns 文件可加载时返回 true
 */
function canLoadImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * 通过后端下发的 COS post-policy 直传文件到对象存储
 * @param file 待上传的文件
 * @param purpose 存储用途
 * @param projectOid 项目 OID（`PROJECT_ASSET` / `PROJECT_SB3` 必传）
 * @returns 上传成功后的文件访问地址（`resourceUrl`）
 */
export async function uploadFile(
  file: File,
  purpose: StoragePurpose,
  projectOid?: string,
): Promise<string> {
  const contentHash = await fileMd5(file);
  const policy = await communityWeb.getStoragePostPolicy(
    purpose,
    file.name,
    file.type,
    file.size,
    contentHash,
    projectOid,
  );
  const form = new FormData();
  for (const [key, value] of Object.entries(policy.fields)) {
    form.append(key, value);
  }
  // 直传端点要求 file 字段必须放在最后
  form.append('file', file, file.name);
  try {
    const res = await fetch(policy.url, { method: 'POST', body: form });
    if (!res.ok) {
      throw new Error(`COS 直传失败: ${res.status}`);
    }
    return policy.resourceUrl;
  } catch (e) {
    // 本地开发环境 origin 不在 COS CORS 白名单时，上传可能已成功但响应被浏览器拦截，
    // 用图片加载探测二次确认，避免把成功的上传误报为失败
    if (await canLoadImage(policy.resourceUrl)) {
      return policy.resourceUrl;
    }
    throw e;
  }
}
