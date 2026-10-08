import { View, Pressable } from "react-native";
import { Image } from "expo-image";
import {
  Shell,
  AuthGate,
  Muted,
  Section,
  Label,
  ResourceState,
  go,
  theme,
  money,
  Action,
} from "@/design/system";
import { CardPreview } from "@/features/potluck/card-preview";
import { useCard } from "@/features/potluck/card-scene";
import {
  CardAction,
  CardMenu,
  CardReviewRow,
} from "@/features/potluck/card-ui";
import { billIcons } from "@/features/potluck/bill-ui";
import { useResource } from "@/services/client";
import type { Circle } from "@/features/potluck/types";

// Host layout: 573:2058. Spender permissions and provider operations remain
// separately authorized. Figma fixtures are never used as account data.
export default function CardDetail() {
  const resource = useCard(),
    card = resource.data,
    host = card?.role === "host";
  const circle = useResource<Circle>(
    !host && card?.circleId ? "/circles/" + card.circleId : null,
  );
  return (
    <Shell
      title={card?.name ?? "Card"}
      back
      active="Cards"
      titlePlacement="content"
      returnTo="/cards"
      headerAccessory={
        card && <CardMenu onPress={() => go("/card/" + card.id + "/setup")} />
      }
    >
      <AuthGate returnTo={"/card/" + resource.id}>
        <ResourceState
          loading={resource.loading}
          data={card}
          loadingKey={resource.loadingKey}
          error={resource.error}
          retry={resource.reload}
        />
        {card && (
          <>
            <Pressable
              accessibilityRole={host ? "button" : undefined}
              accessibilityLabel={host ? "Balance details" : undefined}
              disabled={!host}
              onPress={
                host ? () => go("/card/" + card.id + "/balance") : undefined
              }
            >
              <CardPreview
                name={card.name}
                design={card.design}
                role={card.role}
                availableMinor={card.availableMinor}
                closed={card.status === "closed"}
                variant="detail"
                onEdit={
                  host ? () => go("/card/" + card.id + "/setup") : undefined
                }
              />
            </Pressable>
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                marginTop: 7,
                marginBottom: 14,
              }}
            >
              {/* Secure in-place reveal and freeze need provider contracts. Do not
                route these labels into the former invented placeholder pages. */}
              <CardAction
                label="Show details"
                icon="eye"
                disabled
                hint="Card credentials have not been issued."
              />
              {host && card.status !== "closed" && (
                <>
                  <CardAction
                    label="Fund card"
                    icon="fund"
                    onPress={() => go("/card/" + card.id + "/fund")}
                  />
                  <CardAction
                    label="Freeze"
                    icon="freeze"
                    disabled
                    hint="No issued credential to freeze."
                  />
                </>
              )}
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Label
                accessibilityRole="header"
                style={{
                  fontSize: 22,
                  lineHeight: 28,
                  fontFamily: "Inter_700Bold",
                }}
              >
                {host ? "Transactions" : "Your activity"}
              </Label>
              <Pressable
                accessibilityRole="button"
                onPress={() => go("/card/" + card.id + "/activity")}
                style={{ minHeight: 44, justifyContent: "center" }}
              >
                <Label style={{ fontSize: 12, color: theme.muted }}>
                  See all
                </Label>
              </Pressable>
            </View>
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
                  <Pressable
                    key={bill.id}
                    accessibilityRole="button"
                    onPress={() => go("/bill/" + bill.id)}
                    style={{
                      minHeight: 62,
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      borderRadius: 22,
                      backgroundColor: "white",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        backgroundColor: theme.mint,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Image
                        source={
                          bill.icon === "internet"
                            ? require("../../../assets/potluck/card-flow/bill-internet.svg")
                            : bill.icon === "lightning"
                              ? require("../../../assets/potluck/card-flow/bill-lightning.svg")
                              : billIcons[bill.icon ?? "bill"]
                        }
                        style={
                          bill.icon === "internet" || bill.icon === "lightning"
                            ? { width: 22, height: 22 }
                            : !bill.icon || bill.icon === "bill"
                              ? { width: 18.5, height: 21.7011 }
                              : { width: 28, height: 28 }
                        }
                        contentFit="contain"
                      />
                    </View>
                    <Label
                      style={{
                        flex: 1,
                        fontSize: 15,
                        lineHeight: 19,
                        fontFamily: "Inter_700Bold",
                      }}
                    >
                      {bill.name}
                    </Label>
                    <Label
                      style={{
                        fontSize: 20,
                        lineHeight: 24,
                        fontFamily: "Inter_700Bold",
                        color: theme.teal,
                      }}
                    >
                      {money(bill.amountMinor)}
                    </Label>
                  </Pressable>
                ))}
                {!card.bills.length && (
                  <Muted>
                    Add a Bill to organize what this Card will be used for.
                  </Muted>
                )}
              </>
            )}
            {!host && (
              <>
                {circle.data && (
                  <CardReviewRow
                    title={circle.data.name}
                    circle
                    onPress={() => go("/circle/" + circle.data!.id)}
                  />
                )}
                <Action
                  label="Your spending permissions"
                  onPress={() => go("/card/" + card.id + "/people")}
                />
              </>
            )}
          </>
        )}
      </AuthGate>
    </Shell>
  );
}
