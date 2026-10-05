export function retryKeys(create: () => string) {
  const pending = new Map<string, string>();
  return {
    for(signature: string) {
      let key = pending.get(signature);
      if (!key) {
        key = create();
        pending.set(signature, key);
      }
      return key;
    },
    complete(signature: string, key: string) {
      if (pending.get(signature) === key) pending.delete(signature);
    },
  };
}
