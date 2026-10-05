import { useState } from "react";
import { Pressable, View } from "react-native";
import { router, useLocalSearchParams, type Href } from "expo-router";
import {
  Shell,
  AuthGate,
  Title,
  Muted,
  Label,
  Action,
  Link,
  ErrorText,
  ResourceState,
  Divider,
  theme,
  money,
  dateLabel,
  styles,
} from "@/design/system";
import {
  useAction,
  useClient,
  useCommand,
  useResource,
} from "@/services/client";
import type { Agreement } from "@/features/potluck/types";
export default function AgreementScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { user } = useClient(),
    command = useCommand(),
    action = useAction(),
    resource = useResource<Agreement>(user ? "/agreements/" + id : null),
    agreement = resource.data;
  const [accepted, setAccepted] = useState(false),
    [canceling, setCanceling] = useState(false);
  return (
    <Shell
      title="Review your share"
      back
      active="Bills"
      footer={
        agreement && (
          <>
            <ErrorText text={action.error} />
            {agreement.status === "offered" ? (
              <>
                <Action
                  label={action.busy ? "Saving�" : "Accept these terms"}
                  disabled={!accepted || action.busy}
                  onPress={() =>
                    action.run(async () => {
                      await command("/agreements/" + id + "/accept", {
                        termsVersion: agreement.termsVersion,
                        accepted: true,
                      });
                      router.replace(("/bill/" + agreement.billId) as Href);
                    })
                  }
                />
                <Link
                  onPress={() =>
                    action.run(async () => {
                      await command("/agreements/" + id + "/decline", {
                        termsVersion: agreement.termsVersion,
                      });
                      await resource.reload();
                    })
                  }
                >
                  Decline proposal
                </Link>
              </>
            ) : agreement.status === "accepted" ? (
              <Action
                label={
                  canceling ? "Confirm cancellation" : "Cancel future agreement"
                }
                danger={canceling}
                secondary={!canceling}
                disabled={action.busy}
                onPress={() =>
                  canceling
                    ? action.run(async () => {
                        await command("/agreements/" + id + "/cancel", {
                          termsVersion: agreement.termsVersion,
                        });
                        await resource.reload();
                        setCanceling(false);
                      })
                    : setCanceling(true)
                }
              />
            ) : null}
          </>
        )
      }
    >
      <AuthGate returnTo={"/agreement/" + id}>
        <ResourceState
          loading={resource.loading}
          error={resource.error}
          retry={resource.reload}
        />
        {agreement && (
          <>
            {canceling && (
              <>
                <Title>Cancel future agreement?</Title>
                <Muted>
                  This stops your future agreement in Potluck. It does not
                  cancel the external service, refund payments or erase earlier
                  obligations. Your history is retained.
                </Muted>
                <Link onPress={() => setCanceling(false)}>
                  Keep my agreement
                </Link>
                <Divider />
              </>
            )}
            <Title>{agreement.billName}</Title>
            <Muted>Hosted by {agreement.hostName}</Muted>
            <Label
              style={{
                fontSize: 44,
                lineHeight: 56,
                fontFamily: "Inter_700Bold",
                color: theme.teal,
              }}
            >
              {money(agreement.amountMinor)}
            </Label>
            <Muted>
              {agreement.terms.frequency} ·{" "}
              {agreement.terms.kind === "flexible"
                ? "estimated share"
                : "fixed share"}
            </Muted>
            <Divider />
            <View style={{ gap: 14 }}>
              <Label>First due {dateLabel(agreement.terms.firstDueDate)}</Label>
              {agreement.terms.kind === "flexible" && (
                <Label>Your maximum {money(agreement.maximumMinor)}</Label>
              )}
              {agreement.terms.kind === "flexible" &&
                agreement.terms.calculation && (
                  <Muted>
                    Your share is {agreement.terms.calculation.numerator} /{" "}
                    {agreement.terms.calculation.denominator} of the final Bill
                    amount, limited to your accepted maximum.
                  </Muted>
                )}
              <Label>Currency: USD</Label>
            </View>
            <Divider />
            <Title small>Your choice, your agreement</Title>
            <Muted>
              Accepting records the proposed amount and schedule. No bank
              account is connected and no automatic debit is authorized by this
              step.
            </Muted>
            {agreement.status === "offered" ? (
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: accepted }}
                aria-checked={accepted}
                onPress={() => setAccepted(!accepted)}
                style={[
                  styles.row,
                  {
                    alignItems: "flex-start",
                    paddingVertical: 14,
                    minHeight: 56,
                  },
                ]}
              >
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    borderWidth: 2,
                    borderColor: theme.teal,
                    backgroundColor: accepted ? theme.teal : "white",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Label style={{ color: "white" }}>✓</Label>
                </View>
                <Label style={{ flex: 1 }}>
                  I agree to this share and schedule. I understand payment
                  authorization is separate.
                </Label>
              </Pressable>
            ) : (
              <Title small>
                {agreement.status === "accepted"
                  ? "Terms accepted"
                  : agreement.status}
              </Title>
            )}
          </>
        )}
      </AuthGate>
    </Shell>
  );
}
