import { useEffect } from "react";
import { router } from "expo-router";
import { useClient, useResource } from "@/services/client";
import { CardActionRow } from "./card-ui";
import type { Card } from "./types";

// Figma 2417:47063. A route parameter alone never proves a successful closure.
export function CardClosureNotice({ id }: { id?: string }) {
  const { user } = useClient();
  const card = useResource<Card>(id && user ? `/cards/${id}` : null);
  const closed = card.data?.status === "closed";
  useEffect(() => {
    if (!closed) return;
    const timer = setTimeout(
      () => router.setParams({ closed: undefined }),
      5000,
    );
    return () => clearTimeout(timer);
  }, [closed, id]);
  return closed ? (
    <CardActionRow
      title="Card closed"
      subtitle="Your saved history is kept."
      icon="cards"
    />
  ) : null;
}
