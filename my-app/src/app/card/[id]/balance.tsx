import { View } from "react-native";
import { Title, Muted, Label, Action, go, money, theme } from "@/design/system";
import { CardScene } from "@/features/potluck/card-scene";
import { PlanningPanel } from "@/features/potluck/planning-controls";
export default function BalanceDetails() {
  return (
    <CardScene
      title="Balance details"
      footer={(card) =>
        card.role === "host" && card.status !== "closed" ? (
          <Action
            label="Fund card"
            onPress={() => go("/card/" + card.id + "/fund")}
          />
        ) : null
      }
    >
      {(card) => (
        <>
          <Title small>{card.name}</Title>
          <PlanningPanel>
            {[
              ["Available to spend", card.availableMinor],
              ["Reserved for bills", card.reservedMinor],
              ["Pending transfers", card.pendingMinor],
            ].map(([label, amount]) => (
              <View
                key={label}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderColor: theme.line,
                }}
              >
                <Muted>{label}</Muted>
                <Label style={{ fontFamily: "Inter_600SemiBold" }}>
                  {typeof amount === "number" ? money(amount) : "Not available"}
                </Label>
              </View>
            ))}
          </PlanningPanel>
          <Title>Reserved for bills</Title>
          <Muted>
            No funds are reserved in an unissued Card setup. Connected Bills
            contain planning amounts only.
          </Muted>
          <Muted>
            Balances and settled transfers will come from the banking provider.
            No available balance is estimated from your Bill amounts.
          </Muted>
        </>
      )}
    </CardScene>
  );
}
