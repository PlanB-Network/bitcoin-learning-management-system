export async function pMap<T>(
  items: T[],
  fn: (item: T) => Promise<void>,
  concurrency: number,
) {
  const queue = [...items];
  const failures: unknown[] = [];
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length > 0) {
      const item = queue.shift()!;
      // Catch so one rejection cannot leave sibling workers producing
      // unhandled rejections; failures are rethrown once all settle.
      try {
        await fn(item);
      } catch (error) {
        failures.push(error);
      }
    }
  });
  await Promise.all(workers);
  if (failures.length > 0) {
    throw new AggregateError(
      failures,
      `pMap: ${failures.length} task(s) failed`,
    );
  }
}
