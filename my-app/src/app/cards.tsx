import { useState } from "react";
import { View } from "react-native";
import {
  Shell,
  AuthGate,
  Title,
  Muted,
  Row,
  ResourceState,
  go,
} from "@/design/system";
import { useClient, useResource } from "@/services/client";
import { CardStack } from "@/features/potluck/card-stack";
import type { Card, Collection } from "@/features/potluck/types";
import { HomeEmptyState } from "@/features/potluck/home-empty-state";
export default function Cards() {
  const { user } = useClient(),
    resource = useResource<Collection<Card>>(user ? "/cards" : null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const selected = resource.data?.items.some((card) => card.id === expanded)
    ? expanded
    : null;
  if (expanded && resource.data && !selected) setExpanded(null);
  return (
    <Shell
      title="Cards"
      active="Cards"
      emptyState={!!resource.data && !resource.data.items.length}
      createMenu
      onBackgroundPress={selected ? () => setExpanded(null) : undefined}
      backgroundAccessibilityLabel="Reset card arrangement"
    >
      <AuthGate returnTo="/cards">
        {!!resource.data?.items.length && (
          <>
            <Title>Your cards</Title>
            <Muted>Tap a card to view controls and activity.</Muted>
          </>
        )}
        <ResourceState
          loading={resource.loading}
          data={resource.data}
          loadingKey={resource.loadingKey}
          error={resource.error}
          retry={resource.reload}
        />
        {!!resource.data?.items.length && (
          <CardStack
            cards={resource.data.items}
            hostId={user?.id}
            selectedId={selected}
            onSelect={setExpanded}
            onOpen={(id) => go("/card/" + id)}
          />
        )}
        {!!resource.data?.items.length && (
          <View style={{ marginTop: 24, gap: 12 }}>
            <Row
              icon="cards"
              title={"Finish " + resource.data.items[0].name + " setup"}
              subtitle="Review setup and spending access before activation."
              onPress={() =>
                go("/card/" + resource.data!.items[0].id + "/setup")
              }
            />
          </View>
        )}
        {resource.data && !resource.data.items.length && (
          <>
            <HomeEmptyState area="Cards" />
          </>
        )}
      </AuthGate>
    </Shell>
  );
}
