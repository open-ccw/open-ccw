export async function promiseTimeout<T>(promise: Promise<T>, timeout: number = 1000): Promise<T> {
  let id: NodeJS.Timeout;
  const res = await Promise.race<T>([
    promise,
    new Promise<T>((_, rej) => {
      id = setTimeout(() => rej(`server side render timeout of ${timeout}ms`), timeout);
    }),
  ]);
  if (!id!) {
    throw new Error('setTimeout failed');
  }
  clearTimeout(id);
  return res;
}
