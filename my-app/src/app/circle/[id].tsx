import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  Shell,
  AuthGate,
  Section,
  Avatar,
  Label,
  Muted,
  Row,
  Action,
  ResourceState,
  styles,
  go,
  money,
} from "@/design/system";
import { useClient, useResource } from "@/services/client";
import type { Circle } from "@/features/potluck/types";
export default function CircleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { user } = useClient();
  const resource = useResource<Circle>(user ? "/circles/" + id : null),
    circle = resource.data;
  return (
    <Shell
      title={circle?.name ?? "Circle"}
      back
      active="Circles"
      footer={
        circle?.role === "host" && (
          <Action
            label="Invite someone"
            onPress={() => go("/circle/" + id + "/invite")}
          />
        )
      }
    >
      <AuthGate returnTo={"/circle/" + id}>
        <ResourceState
          loading={resource.loading}
          error={resource.error}
          retry={resource.reload}
        />
        {circle && (
          <>
            {!!circle.description && <Muted>{circle.description}</Muted>}
            <Section title="People" />
            <View
              style={[
                styles.item,
                styles.row,
                { flexWrap: "wrap", justifyContent: "space-around" },
              ]}
            >
              {circle.people.map((person) => (
                <View
                  key={person.id}
                  style={{ alignItems: "center", gap: 6, width: 64 }}
                >
                  <Avatar name={person.name} />
                  <Label style={{ fontSize: 12, textAlign: "center" }}>
                    {person.name}
                  </Label>
                </View>
              ))}
            </View>
            {circle.privacy === "anonymous" && (
              <Muted>Members’ identities are private.</Muted>
            )}
            <Section
              title="Bills"
              action="+ Bill"
              onAction={() => go("/create/bill?circleId=" + id)}
            />
            {circle.bills.map((bill) => (
              <Row
                key={bill.id}
                title={bill.name}
                subtitle={
                  bill.status === "ended" ? "Ended" : "View agreed shares"
                }
                icon="bills"
                right={<Label>{money(bill.amountMinor)}</Label>}
                onPress={() => go("/bill/" + bill.id)}
              />
            ))}
            {!circle.bills.length && (
              <Muted>
                Bring a shared expense into this Circle when you’re ready.
              </Muted>
            )}
            <Section
              title="Cards"
              action="+ Card"
              onAction={() => go("/create/card?circleId=" + id)}
            />
            {circle.cards.map((card) => (
              <Row
                key={card.id}
                title={card.name}
                subtitle="Setup required"
                icon="cards"
                onPress={() => go("/card/" + card.id)}
              />
            ))}
            {!circle.cards.length && (
              <Muted>Cards you’re permitted to access will appear here.</Muted>
            )}
            <Row
              title="Manage arrangement"
              onPress={() => go("/circle/" + id + "/settings")}
            />
          </>
        )}
      </AuthGate>
    </Shell>
  );
}
