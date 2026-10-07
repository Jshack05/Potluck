import { useState } from "react";
import { Image } from "expo-image";
import { Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
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
  Avatar,
  Row,
  Icon,
  theme,
  money,
  dateLabel,
  styles,
  go,
} from "@/design/system";
import {
  useAction,
  useClient,
  useCommand,
  useResource,
} from "@/services/client";
import { moneyInput } from "@/features/potluck/calendar-model";
import { defaultPersonalMaximum } from "@/features/potluck/presentation-state";
import {
  BillIcon,
  BillPanel,
  BillInfo,
  BillDetailRow,
  Radio,
  billStyles,
} from "@/features/potluck/bill-ui";
import { contributionCadence } from "@/features/potluck/bill-flow-model";
import type { Agreement } from "@/features/potluck/types";

type AgreementView =
  | "change"
  | "review"
  | "choice"
  | "outcome"
  | "manage"
  | "funding"
  | "authorization"
  | "history"
  | "stop"
  | "stopped"
  | "ask";
export default function AgreementScreen() {
  const { id, view } = useLocalSearchParams<{ id: string; view?: string }>(),
    { user } = useClient();
  const resource = useResource<Agreement>(user ? "/agreements/" + id : null);
  if (!resource.data)
    return (
      <Shell title="Your agreement" back active="Bills" hideNavigation>
        <AuthGate returnTo={"/agreement/" + id}>
          <ResourceState {...resource} retry={resource.reload} />
        </AuthGate>
      </Shell>
    );
  return (
    <AgreementFlow
      key={resource.data.id + ":" + resource.data.termsVersion}
      agreement={resource.data}
      initialView={view}
      reload={resource.reload}
    />
  );
}
function AgreementFlow({
  agreement,
  initialView,
  reload,
}: {
  agreement: Agreement;
  initialView?: string;
  reload: () => Promise<void>;
}) {
  const command = useCommand(),
    action = useAction();
  const [view, setView] = useState<AgreementView>(() =>
    ["funding", "authorization", "history", "stop", "ask"].includes(
      initialView ?? "",
    )
      ? (initialView as AgreementView)
      : agreement.status === "offered"
        ? agreement.currentAgreement
          ? "change"
          : "review"
        : "manage",
  );
  const [method, setMethod] = useState<"manual" | "automatic">("manual"),
    [accepted, setAccepted] = useState(false),
    [personalCap, setPersonalCap] = useState("");
  const cadence = contributionCadence(agreement.terms.frequency),
    amount = money(agreement.amountMinor);
  const parentView = agreement.status === "offered" ? "choice" : "manage";
  const back = () => {
    if (action.busy) return;
    if (view === "choice") setView("review");
    else if (["funding", "authorization"].includes(view)) setView(parentView);
    else if (view === "ask")
      setView(agreement.status === "offered" ? "review" : "manage");
    else if (["history", "stop"].includes(view)) setView("manage");
    else if (router.canGoBack()) router.back();
    else go("/bill/" + agreement.billId);
  };
  const accept = () =>
    action.run(async () => {
      if (method !== "manual")
        throw new Error(
          "Automatic contributions need an approved funding provider. No authorization has been recorded.",
        );
      if (!accepted)
        throw new Error("Review and accept your share and schedule.");
      await command("/agreements/" + agreement.id + "/accept", {
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
      await reload();
      setAccepted(false);
      setView("outcome");
    });
  const identity = (
    <View style={styles.row}>
      <BillIcon />
      <View style={{ flex: 1 }}>
        <Title small>{agreement.billName ?? "Your bill"}</Title>
        <Muted>Hosted by {agreement.hostName ?? "your host"}</Muted>
      </View>
    </View>
  );
  const title: Record<AgreementView, string> = {
    change: "Contribution review",
    review: "Bill invitation",
    choice: "Your contribution",
    outcome: "Contribution accepted",
    manage: "Your agreement",
    funding: "Funding account",
    authorization: "Authorization terms",
    history: "Contribution history",
    stop: "Stop contributions",
    stopped: "Contributions stopped",
    ask: "Message your host",
  };
  let footer;
  if (
    (view === "review" || view === "change") &&
    agreement.status === "offered"
  )
    footer = (
      <>
        <Action
          label={view === "change" ? "Review updated terms" : "Continue"}
          disabled={action.busy}
          onPress={() => setView(view === "change" ? "review" : "choice")}
        />
        <Link
          onPress={() =>
            action.run(async () => {
              await command("/agreements/" + agreement.id + "/decline", {
                termsVersion: agreement.termsVersion,
              });
              await reload();
              setView("manage");
            })
          }
        >
          {agreement.currentAgreement ? "Decline change" : "Decline invitation"}
        </Link>
      </>
    );
  else if (view === "choice" && agreement.status === "offered")
    footer = (
      <>
        <Muted>No money moves today.</Muted>
        <Action
          label={
            action.busy
              ? "Saving…"
              : method === "automatic"
                ? "Review automatic setup"
                : `Accept ${amount} ${agreement.terms.frequency} share`
          }
          disabled={action.busy || (method === "manual" && !accepted)}
          onPress={method === "automatic" ? () => setView("funding") : accept}
        />
      </>
    );
  else if (view === "stop" && agreement.status === "accepted")
    footer = (
      <>
        <Action
          label="Stop future contributions"
          disabled={action.busy}
          onPress={() =>
            action.run(async () => {
              await command("/agreements/" + agreement.id + "/cancel", {
                termsVersion: agreement.termsVersion,
              });
              await reload();
              setView("stopped");
            })
          }
        />
        <Action
          secondary
          label="Keep my agreement"
          onPress={() => setView("manage")}
        />
      </>
    );
  else if (view === "outcome" || view === "stopped" || view === "manage")
    footer = (
      <>
        <Action
          label="Back to bill"
          onPress={() => go("/bill/" + agreement.billId)}
        />
        <Action
          secondary
          label="View contribution history"
          onPress={() => setView("history")}
        />
      </>
    );
  else
    footer = (
      <Action
        label={view === "ask" ? "Back to invitation" : "Back"}
        onPress={back}
      />
    );
  return (
    <Shell
      title={title[view]}
      back
      onBack={back}
      hideNavigation
      active="Bills"
      footer={
        <>
          <ErrorText text={action.error} />
          {footer}
        </>
      }
    >
      <AuthGate returnTo={"/agreement/" + agreement.id}>
        {view === "change" && agreement.currentAgreement && (
          <>
            <Image
              source={require("../../../assets/potluck/bill/updated-terms.svg")}
              style={{ width: 64, height: 64, alignSelf: "center" }}
              contentFit="contain"
            />
            <Title>Review your new share</Title>
            <Muted>Your host proposed a change to your contribution.</Muted>
            <BillPanel>
              {identity}
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Muted>Current share</Muted>
                  <Label
                    style={[
                      billStyles.amount,
                      { fontSize: 30, color: theme.ink },
                    ]}
                  >
                    {money(agreement.currentAgreement.amountMinor)}
                  </Label>
                  <Muted>
                    /{" "}
                    {contributionCadence(
                      agreement.currentAgreement.terms.frequency,
                    )}
                  </Muted>
                </View>
                <View style={{ flex: 1 }}>
                  <Muted>Proposed share</Muted>
                  <Label style={[billStyles.amount, { fontSize: 30 }]}>
                    {amount}
                  </Label>
                  <Muted>/ {cadence}</Muted>
                </View>
              </View>
              <Divider />
              <BillDetailRow
                label="Starts"
                value={dateLabel(agreement.terms.firstDueDate)}
              />
              {agreement.terms.kind === "flexible" && (
                <BillDetailRow
                  label="Proposed maximum"
                  value={money(agreement.maximumMinor)}
                />
              )}
            </BillPanel>
            {agreement.terms.reasonForChange && (
              <BillPanel>
                <Title small>Note from your host</Title>
                <Muted>{agreement.terms.reasonForChange}</Muted>
                <Link onPress={() => setView("ask")}>Message the host</Link>
              </BillPanel>
            )}
            <BillInfo>
              Your current agreement stays in place unless you accept the
              proposed terms or cancel it separately.
            </BillInfo>
          </>
        )}
        {view === "review" && (
          <>
            <View style={{ alignItems: "flex-end" }}>
              <Muted>1 of 2</Muted>
            </View>
            <Title>Review your share</Title>
            <View style={styles.row}>
              <Avatar name={agreement.hostName ?? "Host"} size={48} />
              <View style={{ flex: 1 }}>
                <Label style={{ fontFamily: "Inter_600SemiBold" }}>
                  {agreement.hostName ?? "Your host"} invited you
                </Label>
                <Muted>This invitation is for this bill only.</Muted>
              </View>
            </View>
            <BillPanel>
              {identity}
              <Divider />
              <Muted>Your share</Muted>
              <Label style={billStyles.amount}>
                {amount}
                {cadence !== "once" ? " / " + cadence : ""}
              </Label>
              <Muted>
                {agreement.terms.kind === "flexible"
                  ? "Estimated share · personal maximum applies"
                  : "Fixed share"}
              </Muted>
              <Divider />
              <BillDetailRow label="Due" value={agreement.terms.frequency} />
              <BillDetailRow
                label="Starts"
                value={dateLabel(agreement.terms.firstDueDate)}
              />
              <BillDetailRow
                label="Continues"
                value={
                  agreement.terms.frequency === "once"
                    ? "One time"
                    : "Until canceled"
                }
              />
            </BillPanel>
            {agreement.currentAgreement && (
              <BillInfo>
                Your current {money(agreement.currentAgreement.amountMinor)}{" "}
                agreement stays in place unless you accept these new terms or
                cancel it separately.
              </BillInfo>
            )}
            {agreement.terms.reasonForChange && (
              <BillPanel>
                <Title small>Note from your host</Title>
                <Muted>{agreement.terms.reasonForChange}</Muted>
              </BillPanel>
            )}
            <Link onPress={() => setView("ask")}>
              Ask {agreement.hostName ?? "your host"} a question
            </Link>
          </>
        )}
        {view === "choice" && (
          <>
            <View style={{ alignItems: "flex-end" }}>
              <Muted>2 of 2</Muted>
            </View>
            <Title>Choose how you’ll contribute.</Title>
            <BillPanel mint>
              <View style={styles.row}>
                <BillIcon size={36} />
                <Label style={{ flex: 1, fontFamily: "Inter_600SemiBold" }}>
                  {agreement.billName}
                </Label>
                <Label
                  style={{ color: theme.teal, fontFamily: "Inter_700Bold" }}
                >
                  {amount} / {cadence}
                </Label>
              </View>
            </BillPanel>
            <Muted>Payment method</Muted>
            <BillPanel>
              {(["manual", "automatic"] as const).map((value, index) => (
                <View key={value}>
                  {index > 0 && <Divider />}
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: method === value }}
                    aria-checked={method === value}
                    onPress={() => {
                      setMethod(value);
                      setAccepted(false);
                    }}
                    style={[styles.row, { minHeight: 64 }]}
                  >
                    <Radio selected={method === value} />
                    <View style={{ flex: 1 }}>
                      <Title small>
                        {value === "manual" ? "Pay manually" : "Automatic"}
                      </Title>
                      <Muted>
                        {value === "manual"
                          ? "You confirm each transfer."
                          : "Authorize a recurring transfer."}
                      </Muted>
                    </View>
                  </Pressable>
                </View>
              ))}
            </BillPanel>
            <Muted>Use an account</Muted>
            <Row
              title="Choose a funding account"
              subtitle="Connect an account when funding is available"
              icon="bank"
              onPress={() => setView("funding")}
            />
            {agreement.terms.kind === "flexible" && (
              <>
                <Field
                  label="Your personal maximum ($)"
                  value={personalCap}
                  placeholder={String(defaultPersonalMaximum(agreement) / 100)}
                  keyboardType="decimal-pad"
                  onChangeText={(value) => {
                    setPersonalCap(value);
                    setAccepted(false);
                  }}
                />
                <BillInfo>
                  Your share is {agreement.terms.calculation?.numerator ?? 1} /{" "}
                  {agreement.terms.calculation?.denominator ?? 1} of the final
                  bill. If it exceeds your accepted maximum, the entire
                  contribution stops. No shortfall is passed to others.
                </BillInfo>
              </>
            )}
            <Muted>
              {method === "manual"
                ? `By accepting, you agree to the ${amount} ${agreement.terms.frequency} share from ${dateLabel(agreement.terms.firstDueDate)}. You’ll separately confirm each transfer when funding becomes available.`
                : "Automatic funding is not available yet. Reviewing this option does not authorize recurring debits or accept your agreement."}
            </Muted>
            <Link
              onPress={() => {
                try {
                  if (personalCap !== "") moneyInput(personalCap);
                  action.setError("");
                  setView("authorization");
                } catch (error) {
                  action.setError((error as Error).message);
                }
              }}
            >
              View full terms
            </Link>
            {method === "manual" && (
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: accepted }}
                aria-checked={accepted}
                onPress={() => setAccepted(!accepted)}
                style={[styles.row, { minHeight: 56 }]}
              >
                <Radio selected={accepted} />
                <Label style={{ flex: 1, fontSize: 14 }}>
                  I agree to this share and schedule. Payment authorization is
                  separate.
                </Label>
              </Pressable>
            )}
          </>
        )}
        {view === "outcome" && (
          <>
            <Image
              source={require("../../../assets/potluck/bill/celebration.svg")}
              style={{
                width: 160,
                height: 128,
                alignSelf: "center",
                marginVertical: 22,
              }}
              contentFit="contain"
            />
            <Title>Your contribution is set up</Title>
            <Muted>Your share is agreed. Nothing has been paid yet.</Muted>
            <BillPanel>
              <Muted>Your first contribution</Muted>
              <Label style={billStyles.amount}>{amount}</Label>
              <Label>{dateLabel(agreement.terms.firstDueDate)}</Label>
              <Divider />
              <Row
                title="Funding account needed"
                subtitle="No account selected or debit authorized"
                icon="bank"
                onPress={() => setView("funding")}
              />
              <Muted>Manual payment</Muted>
            </BillPanel>
            <Muted>You’ll confirm a transfer when funding is available.</Muted>
            <Link onPress={() => setView("manage")}>
              View contribution terms
            </Link>
          </>
        )}
        {view === "manage" && (
          <>
            <Title>Your contribution</Title>
            <BillPanel>
              {identity}
              <Label style={[billStyles.amount, { fontSize: 28 }]}>
                {amount} / {cadence}
              </Label>
              <Muted>
                {agreement.status === "accepted"
                  ? "Terms accepted · funding not authorized"
                  : agreement.status === "declined"
                    ? "Invitation declined"
                    : agreement.status === "canceled"
                      ? "Future agreement canceled"
                      : "Review pending"}
              </Muted>
            </BillPanel>
            <BillPanel>
              <BillDetailRow label="Due" value={agreement.terms.frequency} />
              <Divider />
              <BillDetailRow
                label="Starts"
                value={dateLabel(agreement.terms.firstDueDate)}
              />
              <Divider />
              <BillDetailRow
                label="Payment method"
                value="Separate payment authorization required"
              />
              <BillDetailRow
                label="Bank account"
                value="No authorized account"
              />
              <BillDetailRow
                label="Continues"
                value={
                  agreement.terms.frequency === "once"
                    ? "One time"
                    : "Until canceled"
                }
              />
              {agreement.terms.kind === "flexible" && (
                <BillDetailRow
                  label="Your maximum"
                  value={money(agreement.maximumMinor)}
                />
              )}
            </BillPanel>
            {agreement.status === "accepted" && (
              <>
                <Row
                  title="Change funding account"
                  icon="bank"
                  onPress={() => setView("funding")}
                />
                <Row
                  title="Stop future contributions"
                  icon="agreement"
                  onPress={() => setView("stop")}
                />
              </>
            )}
            {agreement.status === "declined" && (
              <BillInfo>
                {agreement.currentAgreement
                  ? "Your previous agreement is unchanged. Your host can send a revised proposal for review."
                  : "No contribution was accepted for this proposal. Your host can send revised terms."}
              </BillInfo>
            )}
            <BillInfo>
              Contributing does not give access to the shared card.
            </BillInfo>
          </>
        )}
        {view === "funding" && (
          <>
            <Title>Choose an account</Title>
            <Muted>Use one of your connected accounts.</Muted>
            <BillPanel>
              <View style={styles.row}>
                <Icon name="bank" size={32} />
                <Title small>No eligible accounts available</Title>
              </View>
              <Muted>
                Account selection requires an approved bank connection. No
                account has been assigned to this agreement.
              </Muted>
            </BillPanel>
            <Action
              label="Connect an account"
              onPress={() =>
                go(
                  "/connect-bank?returnTo=" +
                    encodeURIComponent(
                      "/agreement/" + agreement.id + "?view=funding",
                    ),
                )
              }
            />
            <BillInfo>
              Connecting an account does not authorize a contribution. Automatic
              payments require separate terms and explicit consent.
            </BillInfo>
          </>
        )}
        {view === "authorization" && (
          <>
            <Title>Your contribution terms</Title>
            <Muted>Review exactly what you are agreeing to.</Muted>
            <BillPanel>
              {identity}
              <Divider />
              <BillDetailRow label="Amount" value={amount} />
              <BillDetailRow
                label="Frequency"
                value={agreement.terms.frequency}
              />
              <BillDetailRow
                label="Applies from"
                value={dateLabel(agreement.terms.firstDueDate)}
              />
              <BillDetailRow
                label="Continues"
                value={
                  agreement.terms.frequency === "once"
                    ? "One time"
                    : "Until canceled"
                }
              />
              <BillDetailRow label="Funding account" value="Not selected" />
              {agreement.terms.kind === "flexible" && (
                <BillDetailRow
                  label="Maximum"
                  value={money(
                    personalCap !== ""
                      ? moneyInput(personalCap)
                      : defaultPersonalMaximum(agreement),
                  )}
                />
              )}
            </BillPanel>
            <BillInfo>
              These are contribution terms only. No bank debit or automatic
              transfer is authorized. Provider authorization must separately
              identify the exact funding account and accepted terms.
            </BillInfo>
          </>
        )}
        {view === "history" && (
          <>
            <Title>Your contribution history</Title>
            <BillPanel>
              {identity}
              <Divider />
              <Title small>No transfers recorded</Title>
              <Muted>
                Accepting terms does not mean a payment was sent or received.
              </Muted>
              {agreement.acceptedAt && (
                <BillDetailRow
                  label="Terms accepted"
                  value={dateLabel(agreement.acceptedAt)}
                />
              )}
            </BillPanel>
            <BillInfo>
              Past contribution records remain available after the agreement
              ends.
            </BillInfo>
          </>
        )}
        {view === "stop" && (
          <>
            <Title>Stop future contributions?</Title>
            <Muted>Review what changes for this bill.</Muted>
            <BillPanel>
              {identity}
              <Divider />
              <BillDetailRow
                label="Your recurring share"
                value={amount + " / " + cadence}
              />
              <BillDetailRow label="Payment authorization" value="Not active" />
              <Divider />
              <BillDetailRow label="Stops" value="After you confirm" />
            </BillPanel>
            <Label>
              This ends your future contribution agreement for this bill.
            </Label>
            <BillInfo>
              Existing obligations and transfer history are not erased. Ending
              the agreement does not cancel the external service or remove
              Circle membership.
            </BillInfo>
          </>
        )}
        {view === "stopped" && (
          <>
            <Title>Future contributions are stopped</Title>
            <BillPanel>
              {identity}
              <Divider />
              <Muted>
                Your agreement is canceled. Earlier obligations and history
                remain.
              </Muted>
            </BillPanel>
            <BillInfo>
              Your Circle and the external service are unchanged.
            </BillInfo>
          </>
        )}
        {view === "ask" && (
          <>
            <Title>Ask about your share</Title>
            <Label
              style={{ color: theme.teal, fontFamily: "Inter_600SemiBold" }}
            >
              {agreement.hostName ?? "Your host"} · {agreement.billName}
            </Label>
            <BillPanel>
              <Label>
                Have a question before accepting? Ask your host what this bill
                covers or how your share was calculated.
              </Label>
            </BillPanel>
            <BillInfo>
              Direct Bill conversations are not connected yet. Your invitation
              stays open while you contact your host.
            </BillInfo>
          </>
        )}
      </AuthGate>
    </Shell>
  );
}
