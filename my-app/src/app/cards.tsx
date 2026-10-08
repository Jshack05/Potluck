import { useState } from "react";
import { Pressable, View } from "react-native";
import {
  Shell,
  AuthGate,
  Title,
  Muted,
  Row,
  Link,
  ResourceState,
  go,
} from "@/design/system";
import { useClient, useResource } from "@/services/client";
import { CardPreview } from "@/features/potluck/card-preview";
import type { Card, Collection } from "@/features/potluck/types";
import { HomeEmptyState } from "@/features/potluck/home-empty-state";
export default function Cards() {
  const { user } = useClient(),
    resource = useResource<Collection<Card>>(user ? "/cards" : null);
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <Shell
      title="Cards"
      active="Cards"
      emptyState={!!resource.data && !resource.data.items.length}
      createMenu
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
          <View
            style={{ gap: 0, paddingTop: resource.data?.items.length ? 8 : 0 }}
          >
            {resource.data?.items.map((card, index, cards) => (
              <Pressable
                key={card.id}
                accessibilityRole="button"
                accessibilityLabel={
                  (expanded === card.id || cards.length === 1
                    ? "Open "
                    : "Expand ") + card.name
                }
                onPress={() =>
                  expanded === card.id || cards.length === 1
                    ? go("/card/" + card.id)
                    : setExpanded(card.id)
                }
                style={{
                  marginTop:
                    index === 0
                      ? 0
                      : expanded === cards[index - 1].id
                        ? 12
                        : -118,
                  zIndex: index,
                }}
              >
                <CardPreview
                  name={card.name}
                  design={card.design}
                  role={card.hostId === user?.id ? "host" : null}
                />
              </Pressable>
            ))}
          </View>
        )}
        {expanded && (
          <Link onPress={() => setExpanded(null)}>Collapse cards</Link>
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
