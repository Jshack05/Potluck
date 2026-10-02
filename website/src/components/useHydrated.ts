import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

// The hydration render must match the static page even when client media differs.
export function useHydrated() {
  return useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
}
