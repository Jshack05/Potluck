type Dependencies = {
  store: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<void>;
    remove: (key: string) => Promise<void>;
  };
  createKey: () => string;
};
const inflight = new Map<string, Promise<unknown>>();
export async function durableCommand<T>(
  identity: string,
  deps: Dependencies,
  send: (key: string) => Promise<T>,
): Promise<T> {
  const running = inflight.get(identity);
  if (running) return running as Promise<T>;
  const operation = (async () => {
    const key = (await deps.store.get(identity)) ?? deps.createKey();
    await deps.store.set(identity, key);
    const result = await send(key);
    await deps.store.remove(identity);
    return result;
  })();
  inflight.set(identity, operation);
  try {
    return await operation;
  } finally {
    if (inflight.get(identity) === operation) inflight.delete(identity);
  }
}
