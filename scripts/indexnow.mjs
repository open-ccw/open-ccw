/**
 * IndexNow 手动推送脚本。
 * 用法：node scripts/indexnow.mjs <host> [urls...]
 * 不传 urls 时自动从 https://<host>/sitemap.xml 拉取全部 URL。
 */
const HOST = process.argv[2];
const KEY = 'e13f190b8bf84161b3b1acc7cc7a65cd';
const URL_ARGS = process.argv.slice(3);

if (!HOST) {
  console.error('用法: node scripts/indexnow.mjs <host> [urls...]');
  process.exit(1);
}

const urls =
  URL_ARGS.length > 0
    ? URL_ARGS
    : await fetch(`https://${HOST}/sitemap.xml`)
        .then((res) => {
          if (!res.ok) throw new Error(`sitemap.xml 返回 ${res.status}`);
          return res.text();
        })
        .then((xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));

if (urls.length === 0) {
  console.error('没有可提交的 URL');
  process.exit(1);
}

const body = {
  host: HOST,
  key: KEY,
  keyLocation: `https://${HOST}/${KEY}.txt`,
  urlList: urls,
};

const res = await fetch('https://api.indexnow.org/IndexNow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
});
const text = await res.text();
console.log(`提交 ${urls.length} 个 URL，IndexNow 响应: ${res.status}`);
if (text) console.log(text);
// 200 = 已收录或此前已提交；202 = 已接受待处理
if (res.status !== 200 && res.status !== 202) {
  process.exit(1);
}
