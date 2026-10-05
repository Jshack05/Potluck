import { useState } from "react";
import { moneyInput } from "@/features/potluck/calendar-model";
import { defaultPersonalMaximum } from "@/features/potluck/presentation-state";
import { Pressable, View } from "react-native";
import { router, useLocalSearchParams, type Href } from "expo-router";
import {
  Shell,
  AuthGate,
  Title,
  Muted,
  Label,
  Field,
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
    [personalCap, setPersonalCap] = useState(""),
    [canceling, setCanceling] = useState(false);
  const reviewIdentity = [
    id,
    user?.id,
    agreement?.termsVersion,
    agreement?.status,
  ].join(":");
  const [previousReview, setPreviousReview] = useState(reviewIdentity);
  if (previousReview !== reviewIdentity) {
    setPreviousReview(reviewIdentity);
    setAccepted(false);
    setPersonalCap("");
    setCanceling(false);
  }
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
                  label={action.busy ? "Saving…" : "Accept these terms"}
                  disabled={!accepted || action.busy}
                  onPress={() =>
                    action.run(async () => {
                      await command("/agreements/" + id + "/accept", {
                        termsVersion: agreement.termsVersion,
                        accepted: true,
                        ...(agreement.terms.kind === "flexible"
                          ? {
                              personalMaximumMinor:
                                personalCap !== ""
                                  ? moneyInput(personalCap)
                                  : defaultPersonalMaximum(agreement),
                            }
                          : {}),
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
            {agreement.currentAgreement && (
              <>
                <Title small>
                  Your host proposed a change to your contribution.
                </Title>
                <Muted>
                  Your current agreement stays in place unless you accept the
                  new terms or cancel it separately.
                </Muted>
                <Label>
                  Current: {money(agreement.currentAgreement.amountMinor)} ·{" "}
                  {agreement.currentAgreement.terms.frequency}
                </Label>
                {agreement.currentAgreement.terms.kind === "flexible" && (
                  <Muted>
                    Current maximum:{" "}
                    {money(agreement.currentAgreement.maximumMinor)}
                  </Muted>
                )}
                <Divider />
                <Title small>
                  {agreement.status === "declined"
                    ? "Declined proposal"
                    : "Proposed share"}
                </Title>
              </>
            )}
            {agreement.terms.reasonForChange && (
              <>
                <Title small>Note from your host</Title>
                <Muted>{agreement.terms.reasonForChange}</Muted>
              </>
            )}
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
              {agreement.terms.kind === "flexible" &&
                (agreement.status === "offered" ? (
                  <>
                    <Field
                      label="Your personal maximum ($)"
                      value={personalCap}
                      placeholder={String(
                        defaultPersonalMaximum(agreement) / 100,
                      )}
                      keyboardType="decimal-pad"
                      onChangeText={(value) => {
                        setPersonalCap(value);
                        setAccepted(false);
                      }}
                    />
                    <Muted>
                      Choose a lower maximum or keep{" "}
                      {money(defaultPersonalMaximum(agreement))}. Only you can
                      accept a higher limit in a new proposal.
                    </Muted>
                  </>
                ) : (
                  <Label>Your maximum {money(agreement.maximumMinor)}</Label>
                ))}
              {agreement.terms.kind === "flexible" &&
                agreement.terms.calculation && (
                  <Muted>
                    Your share is {agreement.terms.calculation.numerator} /{" "}
                    {agreement.terms.calculation.denominator} of the final Bill
                    amount. If that share exceeds your accepted maximum, the
                    entire contribution stops. Your maximum is not a partial
                    payment, and the shortfall is not passed to other people.
                  </Muted>
                )}
              <Label>Currency: USD</Label>
            </View>
            {agreement.terms.kind === "flexible" &&
              agreement.maximumMinor < agreement.amountMinor && (
                <Muted>
                  The estimate already exceeds your maximum. No contribution can
                  be initiated at that amount.
                </Muted>
              )}
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
            {agreement.status === "declined" && (
              <Muted>
                {agreement.currentAgreement
                  ? "Your previous agreement is unchanged. The host can send a revised proposal for you to review."
                  : "You have no accepted contribution for this proposal. The host can send revised terms."}
              </Muted>
            )}
          </>
        )}
      </AuthGate>
    </Shell>
  );
}
