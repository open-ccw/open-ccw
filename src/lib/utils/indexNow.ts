const API_KEY = 'e13f190b8bf84161b3b1acc7cc7a65cd';
const HOSTS = ['ccw.kivotos.qzz.io', 'openccw.dpdns.org'];

export function indexNow(path: string) {
  if (path.startsWith('/')) {
    path = path.substring(1);
  }
  return Promise.all(
    HOSTS.map(async (Host) => {
      const url = new URL('https://api.indexnow.org/indexnow');
      url.searchParams.set('url', `https://${Host}/${path}`);
      url.searchParams.set('key', API_KEY);
      const res = await fetch(url, {
        method: 'GET',
        mode: 'no-cors',
      });
      if (!res.ok) {
        console.error(HOSTS, res.status);
      }
      return res;
    }),
  );
}
