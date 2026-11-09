const API_KEY = 'e13f190b8bf84161b3b1acc7cc7a65cd';
const HOSTS = ['ccw.kivotos.qzz.io', 'openccw.dpdns.org'];

export function indexnow(paths: string[]) {
  return Promise.all(
    HOSTS.map((Host) =>
      fetch('https://api.indexnow.org/IndexNow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        // Host 是受保护头，Workers fetch 中不可显式设置（会被忽略甚至报错），交给运行时自动生成
        body: JSON.stringify({
          host: Host,
          key: API_KEY,
          keyLocation: `https://${Host}/${API_KEY}.txt`,
          // 规整前导斜杠，避免路径出现双斜杠
          urlList: paths.map((path) => `https://${Host}/${path.replace(/^\/+/, '')}`),
        }),
      }),
    ),
  );
}