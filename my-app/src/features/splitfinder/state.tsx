import { createContext, useContext, useState, type ReactNode } from "react";
import {
  appendMessage,
  toggleSaved,
  type Category,
  type Conversations,
} from "./model";
function usePreviewState() {
  const [introduced, setIntroduced] = useState(false);
  const [category, setCategory] = useState<Category>("housing");
  const [query, setQuery] = useState("");
  const [maxMinor, setMaxMinor] = useState<number | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [messages, setMessages] = useState<Conversations>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  return {
    introduced,
    setIntroduced,
    category,
    setCategory,
    query,
    setQuery,
    maxMinor,
    setMaxMinor,
    saved,
    messages,
    drafts,
    save: (id: string) => setSaved((current) => toggleSaved(current, id)),
    draft: (id: string, value: string) =>
      setDrafts((current) => ({ ...current, [id]: value })),
    send: (id: string) => {
      const text = drafts[id] ?? "";
      if (!text.trim() || text.trim().length > 2000) return;
      setMessages((current) => appendMessage(current, id, text));
      setDrafts((current) => ({ ...current, [id]: "" }));
    },
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
