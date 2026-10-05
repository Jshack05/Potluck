import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { submitCreation, type CreationDraft } from "./creation-draft-model";

export function useCreationDraft<F extends object, R extends { id: string }>(
  key: string | null,
  initial: F,
) {
  const [seed] = useState<CreationDraft<F, R>>(() => ({
    workflowId: Crypto.randomUUID(),
    fields: initial,
    pending: null,
    result: null,
  }));
  const [state, setState] = useState(seed),
    current = useRef(seed),
    queue = useRef(Promise.resolve());
  const [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [attempt, setAttempt] = useState(0),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    if (!key) return;
    void AsyncStorage.getItem(key)
      .then((raw) => {
        if (!active) return;
        const saved = raw ? JSON.parse(raw) : seed;
        current.current = saved;
        setState(saved);
        setReady(true);
        setError("");
      })
      .catch(() => {
        if (active)
          setError(
            "Your draft could not be restored. Retry before continuing.",
          );
      });
    return () => {
      active = false;
    };
  }, [key, seed, attempt]);
  function write(next: CreationDraft<F, R>) {
    if (!key) return Promise.reject(new Error("Sign in to save this draft."));
    const operation = queue.current.then(() =>
      AsyncStorage.setItem(key, JSON.stringify(next)),
    );
    queue.current = operation.catch(() => {});
    return operation;
  }
  function update<K extends keyof F>(field: K, value: F[K]) {
    if (!ready || busy || current.current.pending || current.current.result)
      return;
    const next = {
      ...current.current,
      fields: { ...current.current.fields, [field]: value },
    };
    current.current = next;
    setState(next);
    void write(next).catch(() =>
      setError("The draft could not be saved on this device."),
    );
  }
  async function submit(
    body: Record<string, unknown>,
    send: (body: Record<string, unknown>, identity: string) => Promise<R>,
  ) {
    if (!ready || busy)
      throw new Error("Wait for the draft to finish loading.");
    setBusy(true);
    try {
      await queue.current;
      return await submitCreation(current.current, body, send, async (next) => {
        await write(next);
        current.current = next;
        setState(next);
        setError("");
      });
    } finally {
      setBusy(false);
    }
  }
  async function clear() {
    await queue.current;
    if (key) await AsyncStorage.removeItem(key);
  }
  return {
    fields: state.fields,
    ready,
    error,
    busy,
    locked: busy || !ready || Boolean(state.pending || state.result),
    resuming: Boolean(state.pending || state.result),
    update,
    submit,
    clear,
    retry: () => setAttempt((n) => n + 1),
  };
}
