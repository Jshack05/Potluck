import { useState } from "react";
import { Pressable, View } from "react-native";
import {
  Title,
  Muted,
  Label,
  Action,
  Field,
  ErrorText,
  money,
  go,
  theme,
} from "@/design/system";
import { CardScene } from "@/features/potluck/card-scene";
import { PlanningPanel } from "@/features/potluck/planning-controls";
import { moneyInput } from "@/features/potluck/calendar-model";
export default function FundCard() {
  const [amount, setAmount] = useState(""),
    [review, setReview] = useState(false),
    [error, setError] = useState("");
  function next() {
    try {
      if (moneyInput(amount) <= 0)
        throw new Error("Enter an amount greater than zero.");
      setError("");
      setReview(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <CardScene
      title={review ? "Review transfer" : "Fund card"}
      footer={(card) =>
        card.role === "host" && card.status !== "closed" ? (
          <>
            <ErrorText text={error} />
            <Action
              label={review ? "Connect funding account" : "Review transfer"}
              onPress={() =>
                review
                  ? go(
                      "/connect-bank?returnTo=" +
                        encodeURIComponent("/card/" + card.id + "/fund"),
                    )
                  : next()
              }
            />
            {review && (
              <Action
                secondary
                label="Change amount"
                onPress={() => setReview(false)}
              />
            )}
          </>
        ) : null
      }
    >
      {(card) =>
        card.role !== "host" || card.status === "closed" ? (
          <Muted>Only the host of an open Card setup can plan funding.</Muted>
        ) : (
          <>
            {!review ? (
              <>
                <Title small>{card.name}</Title>
                <Field
                  label="Amount to add"
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                  style={{
                    backgroundColor: "transparent",
                    borderWidth: 0,
                    fontSize: 40,
                    fontFamily: "Inter_700Bold",
                    color: theme.teal,
                    paddingLeft: 0,
                  }}
                />
                <View style={{ flexDirection: "row", gap: 10 }}>
                  {[25, 50, 100, 250].map((value) => (
                    <Pressable
                      key={value}
                      accessibilityRole="button"
                      accessibilityLabel={"Add " + value + " dollars"}
                      onPress={() => setAmount(String(value))}
                      style={{
                        flex: 1,
                        backgroundColor: "white",
                        borderRadius: 12,
                        paddingVertical: 12,
                        alignItems: "center",
                      }}
                    >
                      <Label style={{ color: theme.teal }}>
                        {money(value * 100)}
                      </Label>
                    </Pressable>
                  ))}
                </View>
                <PlanningPanel>
                  <Title small>Your funding accounts</Title>
                  <Muted>No eligible funding account is available.</Muted>
                  <Muted>
                    Connect an eligible bank account before a transfer can be
                    submitted.
                  </Muted>
                </PlanningPanel>
                <Title small>One-time bank transfer</Title>
                <Muted>
                  Funds become available only after settlement. No transfer has
                  been submitted.
                </Muted>
              </>
            ) : (
              <>
                <Label
                  style={{
                    fontSize: 40,
                    lineHeight: 50,
                    fontFamily: "Inter_700Bold",
                    color: theme.teal,
                  }}
                >
                  {money(moneyInput(amount))}
                </Label>
                <Muted>One-time transfer · not submitted</Muted>
                <PlanningPanel>
                  {[
                    ["From", "No funding account connected"],
                    ["To", card.name],
                    ["For", "Available spending"],
                    ["Frequency", "One time"],
                  ].map(([title, value]) => (
                    <View
                      key={title}
                      style={{
                        flexDirection: "row",
                        gap: 16,
                        justifyContent: "space-between",
                        paddingVertical: 12,
                      }}
                    >
                      <Muted>{title}</Muted>
                      <Label
                        style={{
                          flex: 1,
                          textAlign: "right",
                          fontFamily: "Inter_600SemiBold",
                        }}
                      >
                        {value}
                      </Label>
                    </View>
                  ))}
                </PlanningPanel>
                <Title small>Your approval, this transfer only</Title>
                <Muted>
                  You will need an issued Card, an eligible funding account, and
                  a final transfer confirmation. Connecting a bank account does
                  not authorize this transfer.
                </Muted>
                <Muted>
                  Bank transfers are not available in this build. No money has
                  moved.
                </Muted>
              </>
            )}
          </>
        )
      }
    </CardScene>
  );
}
