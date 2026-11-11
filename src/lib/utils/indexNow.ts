/** IndexNow 提交密钥，对应站点根目录下的 <key>.txt 验证文件 */
const API_KEY = 'e13f190b8bf84161b3b1acc7cc7a65cd';
/** 需要参与收录的域名，主站与镜像站分别提交 */
const HOSTS = ['ccw.kivotos.qzz.io', 'openccw.dpdns.org'];

/**
 * 通过 IndexNow 提交 URL 变更，通知搜索引擎尽快抓取。
 *
 * 走 GET + query 而不是 POST JSON：Workers 运行时发出的 JSON body 请求
 * 会被上游以 415 Unsupported Media Type 拒绝，GET 不需要 Content-Type，更稳。
 * 官方 GET 接口一次只接受一个 url，因此按 域名 × 路径 逐个提交。
 *
 * @param paths 站内路径，可带前导斜杠
 * @returns 全部提交请求完成后兑现（单个失败只记录日志，不影响调用方）
 */
export function indexNow(paths: string[]) {
  const tasks: Promise<unknown>[] = [];

  for (const host of HOSTS) {
    for (const path of paths) {
      const target = new URL('https://api.indexnow.org/indexnow');
      target.searchParams.set('url', `https://${host}/${path.replace(/^\/+/, '')}`);
      target.searchParams.set('key', API_KEY);
      // 始终携带 keyLocation，兼容 Bing 的密钥校验路径
      target.searchParams.set('keyLocation', `https://${host}/${API_KEY}.txt`);

      tasks.push(
        fetch(target)
          .then((res) => {
            if (!res.ok) {
              console.error(`IndexNow 提交失败 ${host}/${path}: ${res.status}`);
            }
          })
          .catch((e) => {
            console.error(`IndexNow 请求异常 ${host}/${path}`, e);
          }),
      );
    }
  }

  return Promise.all(tasks);
}
