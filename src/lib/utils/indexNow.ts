const API_KEY = 'e13f190b8bf84161b3b1acc7cc7a65cd';
const HOSTS = ['ccw.kivotos.qzz.io', 'openccw.dpdns.org'];

export function indexnow(paths: string[]) {
  return Promise.all(
    HOSTS.map((Host) =>
      fetch('https://api.indexnow.org/IndexNow', {
        body: JSON.stringify({
          host: Host,
          key: API_KEY,
          keyLocation: `https://${Host}/${API_KEY}.txt`,
          urlList: paths.map((path) => `https://${Host}/${path}`),
        }),
        method: "POST",
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Host: 'api.indexnow.org',
        }
      }),
    ),
  );
}