import { Pressable } from "react-native";
import {
  Shell,
  AuthGate,
  Title,
  Muted,
  Action,
  Empty,
  ResourceState,
  go,
} from "@/design/system";
import { useClient, useResource } from "@/services/client";
import { CardPreview } from "@/features/potluck/card-preview";
import type { Card, Collection } from "@/features/potluck/types";
export default function Cards() {
  const { user } = useClient(),
    resource = useResource<Collection<Card>>(user ? "/cards" : null);
  return (
    <Shell
      title="Cards"
      active="Cards"
      footer={
        user && (
          <Action label="Create a Card" onPress={() => go("/create/card")} />
        )
      }
    >
      <AuthGate returnTo="/cards">
        <Title>Your cards</Title>
        <Muted>Open a Card to see its setup and connected Bills.</Muted>
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
          <Empty
            icon="cards"
            title="One place for shared expenses"
            detail="Name a Card and connect the Bills you want to manage together."
          />
        )}
      </AuthGate>
    </Shell>
  );
}
