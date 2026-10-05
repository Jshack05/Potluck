import { useLocalSearchParams } from "expo-router";
import {
  Shell,
  AuthGate,
  Title,
  Muted,
  Section,
  Row,
  Action,
  ResourceState,
  go,
} from "@/design/system";
import { useClient, useResource } from "@/services/client";
import { CardPreview } from "@/features/potluck/card-preview";
import type { Card } from "@/features/potluck/types";
export default function CardDetail() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { user } = useClient(),
    resource = useResource<Card>(user ? "/cards/" + id : null),
    card = resource.data;
  return (
    <Shell
      title={card?.name ?? "Card"}
      back
      active="Cards"
      footer={
        card &&
        card.status !== "closed" && (
          <Action
            label="Add a Bill"
            onPress={() =>
              go(
                "/create/bill?cardId=" +
                  id +
                  (card.circleId ? "&circleId=" + card.circleId : ""),
              )
            }
          />
        )
      }
    >
      <AuthGate returnTo={"/card/" + id}>
        <ResourceState
          loading={resource.loading}
          error={resource.error}
          retry={resource.reload}
        />
        {card && (
          <>
            <CardPreview
              name={card.name}
              design={card.design}
              closed={card.status === "closed"}
            />
            <Title>
              {card.status === "closed"
                ? "This setup is closed"
                : "Ready for the next step"}
            </Title>
            <Muted>
              {card.status === "closed"
                ? "No card was issued. Your arrangement history is retained."
                : "Your Card setup is saved. Activation, spending controls and bank funding become available when Potluck’s issuing program is connected."}
            </Muted>
            <Section title="Connected Bills" />
            {card.bills.map((bill) => (
              <Row
                key={bill.id}
                title={bill.name}
                icon="bills"
                onPress={() => go("/bill/" + bill.id)}
              />
            ))}
            {!card.bills.length && (
              <Muted>
                Add a Bill to organize what this Card will be used for.
              </Muted>
            )}
            {card.circleId && (
              <Row
                title="Open Circle"
                icon="circles"
                onPress={() => go("/circle/" + card.circleId)}
              />
            )}
            {card.status !== "closed" && (
              <Row
                title="Manage arrangement"
                onPress={() => go("/manage/cards/" + id)}
              />
            )}
          </>
        )}
      </AuthGate>
    </Shell>
  );
}
