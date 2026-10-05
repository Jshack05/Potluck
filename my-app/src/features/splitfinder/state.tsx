import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Category } from "./model";
function usePreviewState() {
  const [introduced, setIntroduced] = useState(false),
    [category, setCategory] = useState<Category>("housing"),
    [query, setQuery] = useState(""),
    [maxMinor, setMaxMinor] = useState<number | null>(null),
    [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem("potluck.discovery.preference")
      .then((value) => {
        if (active && value) {
          const saved = JSON.parse(value);
          if (
            [
              "subscriptions",
              "memberships",
              "plans",
              "housing",
              "all",
            ].includes(saved.category)
          ) {
            setCategory(saved.category);
            setIntroduced(saved.introduced === true);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (ready)
      void AsyncStorage.setItem(
        "potluck.discovery.preference",
        JSON.stringify({ category, introduced }),
      ).catch(() => {});
  }, [category, introduced, ready]);
  return {
    introduced,
    setIntroduced,
    category,
    setCategory,
    query,
    setQuery,
    maxMinor,
    setMaxMinor,
    ready,
  };
}
const PreviewContext = createContext<ReturnType<typeof usePreviewState> | null>(
  null,
);
export function PreviewProvider({ children }: { children: ReactNode }) {
  const state = usePreviewState();
  return (
    <PreviewContext.Provider value={state}>{children}</PreviewContext.Provider>
  );
}
export function usePreview() {
  const value = useContext(PreviewContext);
  if (!value) throw new Error("PreviewProvider is required");
  return value;
}
