export async function pMap<T>(
  items: T[],
  fn: (item: T) => Promise<void>,
  concurrency: number,
) {
  const queue = [...items];
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length > 0) {
      const item = queue.shift()!;
      await fn(item);
    }
  });
  await Promise.all(workers);
}
