import { Pressable } from "react-native";
import {
  Shell,
  AuthGate,
  Title,
  Muted,
  Action,
  ResourceState,
  go,
} from "@/design/system";
import { useClient, useResource } from "@/services/client";
import { CardPreview } from "@/features/potluck/card-preview";
import type { Card, Collection } from "@/features/potluck/types";
import {
  HomeEmptyState,
  BankAccessPrompt,
} from "@/features/potluck/home-empty-state";
export default function Cards() {
  const { user, access } = useClient(),
    resource = useResource<Collection<Card>>(user ? "/cards" : null);
  if (user && access !== "ready") return <BankAccessPrompt area="Cards" />;
  return (
    <Shell
      title="Cards"
      active="Cards"
      emptyState={!!resource.data && !resource.data.items.length}
      footer={
        user && (
          <Action label="Create a Card" onPress={() => go("/create/card")} />
        )
      }
    >
      <AuthGate returnTo="/cards">
        {!!resource.data?.items.length && (
          <>
            <Title>Your cards</Title>
            <Muted>Open a Card to see its setup and connected Bills.</Muted>
          </>
        )}
        <ResourceState
          loading={resource.loading}
          error={resource.error}
          retry={resource.reload}
        />
        {resource.data?.items.map((card) => (
          <Pressable
            key={card.id}
            accessibilityRole="button"
            accessibilityLabel={"Open " + card.name}
            onPress={() => go("/card/" + card.id)}
            style={{ marginVertical: 8 }}
          >
            <CardPreview name={card.name} design={card.design} />
          </Pressable>
        ))}
        {resource.data && !resource.data.items.length && (
          <HomeEmptyState area="Cards" />
        )}
      </AuthGate>
    </Shell>
  );
}
