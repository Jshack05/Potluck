import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { durableCommand } from "./durable-command";
import { revokeSession, withSessionRecovery } from "./session-recovery";
import {
  parseEntryStatus,
  type EntryAccess,
  type EntryStatus,
} from "./navigation";
export type User = {
  id: string;
  name: string;
  email: string;
  identity: "local" | "supabase";
};
const base = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4100";
let webToken: string | null = null;
const sessions = {
  get: () =>
    Platform.OS === "web"
      ? Promise.resolve(webToken)
      : SecureStore.getItemAsync("potluck.session"),
  set: async (value: string | null) => {
    if (Platform.OS === "web") {
      webToken = value;
      return;
    }
    if (value) await SecureStore.setItemAsync("potluck.session", value);
    else await SecureStore.deleteItemAsync("potluck.session");
  },
};
export class ApiError extends Error {
  code: string;
  status: number;
  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}
async function request<T>(
  path: string,
  token: string | null,
  body?: unknown,
  key?: string,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(base + "/v1" + path, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: "Bearer " + token } : {}),
        ...(key ? { "idempotency-key": key } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(12000),
    });
  } catch {
    throw new ApiError(
      "Could not connect. Check your connection and try again.",
      "CONNECTION_FAILED",
      0,
    );
  }
  const value = await response.json();
  if (!response.ok)
    throw new ApiError(
      value.error?.message ?? "Please try again.",
      value.error?.code ?? "REQUEST_FAILED",
      response.status,
    );
  return value as T;
}
function useClientState() {
  const [token, setToken] = useState<string | null>(null),
    [user, setUser] = useState<User | null>(null),
    [ready, setReady] = useState(false);
  const [entryStatus, setEntryStatus] = useState<EntryStatus | null>(null),
    [access, setAccess] = useState<EntryAccess>("loading"),
    [entryError, setEntryError] = useState("");
  const currentToken = useRef<string | null>(null);
  const clearSession = useCallback(async () => {
    currentToken.current = null;
    setToken(null);
    setUser(null);
    setEntryStatus(null);
    setEntryError("");
    setAccess("signed_out");
    await sessions.set(null);
  }, []);
  const authenticatedRequest = useCallback(
    <T,>(path: string, saved: string | null, body?: unknown, key?: string) =>
      withSessionRecovery(
        () => request<T>(path, saved, body, key),
        async () => {
          // An older request must never sign out a newer account.
          if (saved && currentToken.current === saved) await clearSession();
        },
      ),
    [clearSession],
  );
  useEffect(() => {
    let active = true;
    void sessions
      .get()
      .then(async (saved) => {
        if (!active) return;
        if (saved) {
          try {
            const result = await request<{ user: User }>("/me", saved);
            if (active) {
              currentToken.current = saved;
              setToken(saved);
              setUser(result.user);
              try {
                const state = parseEntryStatus(
                  await authenticatedRequest("/onboarding", saved),
                );
                if (active && currentToken.current === saved) {
                  setEntryStatus(state);
                  setAccess(state.access);
                }
              } catch (e) {
                if (active && currentToken.current === saved) {
                  setAccess("error");
                  setEntryError(
                    e instanceof Error ? e.message : "Please try again.",
                  );
                }
              }
            }
          } catch {
            /* A failed restore never establishes an authenticated identity. */
            if (active) setAccess("signed_out");
          }
        } else if (active) setAccess("signed_out");
      })
      .catch(() => {
        /* Secure storage failure falls back to explicit account entry. */
        if (active) setAccess("signed_out");
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [authenticatedRequest]);
  const get = useCallback(
    <T,>(path: string) => authenticatedRequest<T>(path, token),
    [token, authenticatedRequest],
  );
  const command = useCallback(
    <T,>(path: string, body: unknown, key = Crypto.randomUUID()) =>
      authenticatedRequest<T>(path, token, body, key),
    [token, authenticatedRequest],
  );
  const signIn = async (input: {
    email: string;
    password: string;
    name?: string;
  }) => {
    const result = await request<{ token: string; user: User }>(
      input.name ? "/local/accounts" : "/local/session",
      null,
      input,
    );
    await sessions.set(result.token);
    currentToken.current = result.token;
    setToken(result.token);
    setUser(result.user);
    setEntryStatus(null);
    setEntryError("");
    setAccess("loading");
    try {
      const state = parseEntryStatus(
        await authenticatedRequest("/onboarding", result.token),
      );
      if (currentToken.current !== result.token) return;
      setEntryStatus(state);
      setAccess(state.access);
    } catch (e) {
      if (currentToken.current !== result.token) return;
      setAccess("error");
      setEntryError(e instanceof Error ? e.message : "Please try again.");
    }
  };
  const refreshEntry = async () => {
    if (!token) return;
    setEntryError("");
    try {
      const state = parseEntryStatus(
        await authenticatedRequest("/onboarding", token),
      );
      if (currentToken.current !== token) return;
      setEntryStatus(state);
      setAccess(state.access);
    } catch (e) {
      if (currentToken.current !== token) return;
      setAccess("error");
      setEntryError(e instanceof Error ? e.message : "Please try again.");
    }
  };
  const signOut = async () => {
    await revokeSession(
      async () => {
        if (token) await request("/sign-out", token, {});
      },
      async () => {
        if (currentToken.current === token) await clearSession();
      },
    );
  };
  return {
    user,
    ready,
    access,
    entryStatus,
    entryError,
    refreshEntry,
    get,
    command,
    signIn,
    signOut,
  };
}
const Context = createContext<ReturnType<typeof useClientState> | null>(null);
export function ClientProvider({ children }: { children: ReactNode }) {
  const value = useClientState();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useClient() {
  const value = useContext(Context);
  if (!value) throw new Error("ClientProvider required");
  return value;
}
export function useResource<T>(path: string | null) {
  const { get, user, access } = useClient();
  const key = JSON.stringify([path, user?.id]);
  const [snapshot, setData] = useState<{ key: string; value: T } | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const serial = useRef(0);
  const reload = useCallback(async () => {
    const current = ++serial.current;
    if (!path || access !== "ready") {
      setLoading(false);
      setData(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const value = await get<T>(path);
      if (serial.current === current) setData({ key, value });
    } catch (e) {
      if (serial.current === current)
        setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      if (serial.current === current) setLoading(false);
    }
  }, [get, path, key, access]);
  useFocusEffect(
    useCallback(() => {
      void reload();
      return () => {
        serial.current++;
      };
    }, [reload]),
  );
  return {
    data: snapshot?.key === key ? snapshot.value : null,
    error,
    loading,
    reload,
  };
}
export function useAction() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const running = useRef(false);
  const run = async (fn: () => Promise<unknown>) => {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
      running.current = false;
    }
  };
  return { run, busy, error, setError };
}
export function useCommand() {
  const { command, user } = useClient();
  return async <T,>(path: string, body: unknown, workflowId?: string) => {
    if (!user)
      throw new ApiError("Sign in to continue.", "SIGN_IN_REQUIRED", 401);
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      JSON.stringify([path, body]),
    );
    if (workflowId) return command<T>(path, body, workflowId + ":" + digest);
    return durableCommand(
      "potluck.pending." + user.id + "." + digest,
      {
        createKey: Crypto.randomUUID,
        store: {
          get: AsyncStorage.getItem,
          set: AsyncStorage.setItem,
          remove: AsyncStorage.removeItem,
        },
      },
      (key) => command<T>(path, body, key),
    );
  };
}
