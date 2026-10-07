import { View, Pressable } from "react-native";
import {
  Shell,
  AuthGate,
  Muted,
  Section,
  Row,
  Label,
  ResourceState,
  Icon,
  go,
  theme,
  money,
} from "@/design/system";
import { CardPreview } from "@/features/potluck/card-preview";
import { useCard } from "@/features/potluck/card-scene";
export default function CardDetail() {
  const resource = useCard(),
    card = resource.data,
    host = card?.role === "host";
  return (
    <Shell title={card?.name ?? "Card"} back active="Cards">
      <AuthGate returnTo={"/card/" + resource.id}>
        <ResourceState
          loading={resource.loading}
          data={resource.data}
          loadingKey={resource.loadingKey}
          error={resource.error}
          retry={resource.reload}
        />
        {card && (
          <>
            <View style={{ alignItems: "flex-end" }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Card settings"
                onPress={() => go("/card/" + card.id + "/setup")}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 16,
                  backgroundColor: "white",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Label style={{ color: theme.teal, fontSize: 24 }}>☰</Label>
              </Pressable>
            </View>
            <CardPreview
              name={card.name}
              design={card.design}
              role={card.role}
              availableMinor={card.availableMinor}
              closed={card.status === "closed"}
            />
            <View style={{ flexDirection: "row", gap: 8, marginVertical: 8 }}>
              {(
                [
                  ["Show details", "cards", "details"],
                  ...(host && card.status !== "closed"
                    ? [
                        ["Fund card", "bank", "fund"],
                        ["Freeze", "pending", "controls"],
                      ]
                    : []),
                ] as [string, "cards" | "bank" | "pending", string][]
              ).map(([label, icon, destination]) => (
                <Pressable
                  key={destination}
                  accessibilityRole="button"
                  onPress={() => go("/card/" + card.id + "/" + destination)}
                  style={{
                    flex: 1,
                    minHeight: 48,
                    borderRadius: 14,
                    backgroundColor: "white",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Icon name={icon} size={18} />
                  <Label
                    style={{ fontSize: 11, fontFamily: "Inter_600SemiBold" }}
                  >
                    {label}
                  </Label>
                </Pressable>
              ))}
            </View>
            <Section
              title={host ? "Transactions" : "Your activity"}
              action="See all"
              onAction={() => go("/card/" + card.id + "/activity")}
            />
            <Muted>
              {card.status === "closed"
                ? "This setup is closed. No card was issued."
                : "This Card has not been issued. There are no spending transactions to show."}
            </Muted>
            {host && (
              <>
                <Section
                  title="Bills"
                  action={card.status === "closed" ? undefined : "+"}
                  onAction={() =>
                    go(
                      "/create/bill?cardId=" +
                        card.id +
                        (card.circleId ? "&circleId=" + card.circleId : ""),
                    )
                  }
                />
                {card.bills.map((bill) => (
                  <Row
                    key={bill.id}
                    title={bill.name}
                    icon="bills"
                    right={
                      <Label
                        style={{
                          color: theme.teal,
                          fontFamily: "Inter_700Bold",
                        }}
                      >
                        {money(bill.amountMinor)}
                      </Label>
                    }
                    onPress={() => go("/bill/" + bill.id)}
                  />
                ))}
                {!card.bills.length && (
                  <Muted>
                    Add a Bill to organize what this Card will be used for.
                  </Muted>
                )}
              </>
            )}
            {card.circleId && (
              <Row
                title="Attached Circle"
                icon="circles"
                onPress={() => go("/circle/" + card.circleId)}
              />
            )}
            <Row
              title={
                host ? "People and permissions" : "Your spending permissions"
              }
              icon="circles"
              onPress={() => go("/card/" + card.id + "/people")}
            />
            {host && card.status !== "closed" && (
              <Row
                title="Create a Goal"
                subtitle="Plan a shared purpose for this Card."
                onPress={() =>
                  go(
                    "/create/goal?cardId=" +
                      card.id +
                      (card.circleId ? "&circleId=" + card.circleId : ""),
                  )
                }
              />
            )}
          </>
        )}
      </AuthGate>
    </Shell>
  );
}
