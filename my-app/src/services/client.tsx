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
              setToken(saved);
              setUser(result.user);
            }
          } catch {
            /* A failed restore never establishes an authenticated identity. */
          }
        }
      })
      .catch(() => {
        /* Secure storage failure falls back to explicit account entry. */
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);
  const get = useCallback(
    <T,>(path: string) => request<T>(path, token),
    [token],
  );
  const command = useCallback(
    <T,>(path: string, body: unknown, key = Crypto.randomUUID()) =>
      request<T>(path, token, body, key),
    [token],
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
    setToken(result.token);
    setUser(result.user);
  };
  const signOut = async () => {
    if (token) await request("/sign-out", token, {});
    await sessions.set(null);
    setToken(null);
    setUser(null);
  };
  return { user, ready, get, command, signIn, signOut };
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
  const { get, user } = useClient();
  const key = JSON.stringify([path, user?.id]);
  const [snapshot, setData] = useState<{ key: string; value: T } | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const serial = useRef(0);
  const reload = useCallback(async () => {
    const current = ++serial.current;
    if (!path) {
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
  }, [get, path, key]);
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
