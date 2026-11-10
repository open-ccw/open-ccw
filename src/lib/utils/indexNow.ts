const API_KEY = 'e13f190b8bf84161b3b1acc7cc7a65cd';
const HOSTS = ['ccw.kivotos.qzz.io', 'openccw.dpdns.org'];

export function indexNow(paths: string[]) {
  return Promise.all(
    HOSTS.map((Host) =>
      fetch('https://api.indexnow.org/IndexNow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          host: Host,
          key: API_KEY,
          keyLocation: `https://${Host}/${API_KEY}.txt`,
          // 规整前导斜杠，避免路径出现双斜杠
          urlList: paths.map((path) => `https://${Host}/${path.replace(/^\/+/, '')}`),
        }),
      }).then((res) => {
        if (!res.ok) {
          console.error(HOSTS, res.status);
        }
        return res;
      }),
    ),
  );
}
