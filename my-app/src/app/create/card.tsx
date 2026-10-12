import { useState } from "react";
import { Keyboard, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Shell,
  AuthGate,
  Field,
  Action,
  ErrorText,
  Link,
  ResourceState,
  go,
} from "@/design/system";
import { useCreationDraft } from "@/services/creation-draft";
import {
  useAction,
  useClient,
  useCommand,
  useResource,
} from "@/services/client";
import type { CardAppearanceCategory } from "@/features/potluck/card-appearance-catalog";
import { CardHeading, CardHint } from "@/features/potluck/card-ui";
import {
  CardBankStep,
  betaBankNotice,
  type BetaBankAccount,
} from "@/features/potluck/card-bank-step";
import {
  CardAppearancePicker,
  CardCirclePicker,
  CardCreationReview,
} from "@/features/potluck/card-creation-steps";
import type { Card, Circle, Collection } from "@/features/potluck/types";

export default function CreateCard() {
  const { user } = useClient(),
    { circleId } = useLocalSearchParams<{ circleId?: string }>();
  return <CardForm key={(user?.id ?? "guest") + ":" + (circleId ?? "new")} />;
}
function CardForm() {
  const { circleId } = useLocalSearchParams<{ circleId?: string }>(),
    { user } = useClient(),
    command = useCommand(),
    action = useAction();
  const draft = useCreationDraft<
    {
      name: string;
      design: Card["design"];
      circleId: string | null;
      step: number;
      betaAccountId?: string;
    },
    Card
  >(user ? "potluck.draft.card." + user.id + "." + (circleId ?? "new") : null, {
    name: "",
    design: "graphite",
    circleId: circleId ?? null,
    step: 0,
  });
  const circles = useResource<Collection<Circle>>(user ? "/circles" : null);
  const capabilities = useResource<{ betaBankLinking: boolean }>(
    user ? "/capabilities" : null,
  );
  const betaBankLinking = capabilities.data?.betaBankLinking === true;
  const accounts = useResource<Collection<BetaBankAccount>>(
    user && betaBankLinking ? "/beta/bank-accounts" : null,
  );
  const selectedAccount = accounts.data?.items.find(
    (account) => account.id === draft.fields.betaAccountId,
  );
  const bankReady = !!accounts.data && !accounts.loading && !accounts.error;
  const capabilityReady =
    !!capabilities.data && !capabilities.loading && !capabilities.error;
  const needsConnection = bankReady && accounts.data!.items.length === 0;
  const { name, design } = draft.fields;
  // A new Card is owned by its creator. Display identity comes from the session,
  // never from a persisted draft or a user-selectable permission field.
  const identity = { fullName: user?.name ?? "", role: "host" as const };
  const selectedCircleId =
    draft.fields.circleId === undefined
      ? (circleId ?? null)
      : draft.fields.circleId;
  const selectedCircle = circles.data?.items.find(
    (c) => c.id === selectedCircleId,
  );
  // Keep persisted Circle/review step numbers and old appearance drafts compatible.
  const storedStep = draft.fields.step ?? 0;
  // Step 4 is additive: older saved step 3 and pending submissions retain meaning.
  const step = draft.resuming
    ? 3
    : storedStep === 1
      ? 0
      : storedStep === 3 && betaBankLinking && !selectedAccount
        ? 4
        : storedStep === 4 && capabilityReady && !betaBankLinking
          ? 3
          : storedStep;
  const afterCircle = betaBankLinking ? 4 : 3;
  const [expandedCategories, setExpandedCategories] = useState<
    CardAppearanceCategory[]
  >([]);
  function setStep(value: number) {
    draft.update("step", value);
  }
  const editableCircles =
    circles.data?.items.filter(
      (circle) => circle.privacy === "normal" || circle.hostId === user?.id,
    ) ?? [];
  async function save() {
    await action.run(async () => {
      await draft.submit(
        {
          name,
          design,
          circleId: selectedCircleId,
          ...(betaBankLinking && selectedAccount
            ? { betaAccountId: selectedAccount.id }
            : {}),
        },
        (body, identity) => command<Card>("/cards", body, identity),
      );
      router.replace("/cards");
      await draft.clear();
    });
  }
  async function connect() {
    await action.run(async () => {
      const result = await command<Collection<BetaBankAccount>>(
        "/beta/bank-accounts/connect",
        {},
      );
      // Remain on the selection step so the user can review or change the default.
      draft.update("betaAccountId", result.items[0]?.id);
      setStep(4);
      await accounts.reload();
    });
  }
  return (
    <Shell
      title={
        [
          "Create card",
          "Create card",
          "Attach a Circle",
          "Review card",
          "Bank account",
        ][step]
      }
      back
      headerTitleSize={28}
      hideNavigation
      active="Cards"
      avoidKeyboard={step !== 0}
      onBack={() =>
        step === 3
          ? setStep(betaBankLinking ? 4 : 2)
          : step === 4
            ? setStep(2)
            : step === 2
              ? setStep(0)
              : router.back()
      }
      footer={
        user && (
          <>
            <ErrorText text={action.error || draft.error} />
            {!draft.ready && draft.error && (
              <Link onPress={draft.retry}>Retry draft</Link>
            )}
            <Action
              label={
                action.busy
                  ? "Saving…"
                  : step === 3
                    ? draft.resuming
                      ? "Finish Card setup"
                      : "Create card"
                    : step === 4 && needsConnection
                      ? "Connect bank account"
                      : "Continue"
              }
              disabled={
                action.busy ||
                !draft.ready ||
                !name.trim() ||
                (!draft.resuming &&
                  step >= 2 &&
                  (!capabilityReady ||
                    (betaBankLinking &&
                      step !== 2 &&
                      (!bankReady ||
                        (!needsConnection && !selectedAccount))))) ||
                (!draft.resuming &&
                  step >= 2 &&
                  !!selectedCircleId &&
                  !editableCircles.some((c) => c.id === selectedCircleId))
              }
              onPress={() => {
                Keyboard.dismiss();
                if (step === 3) void save();
                else if (step === 4 && needsConnection) void connect();
                else setStep(step === 0 ? 2 : step === 2 ? afterCircle : 3);
              }}
            />
          </>
        )
      }
    >
      <AuthGate returnTo="/create/card">
        {step >= 2 && !draft.resuming && (
          <ResourceState
            loading={capabilities.loading}
            data={capabilities.data}
            loadingKey={capabilities.loadingKey}
            error={capabilities.error}
            retry={capabilities.reload}
          />
        )}
        {step === 0 && (
          <>
            <CardHint>
              Give your card a name and choose a virtual card design.
            </CardHint>
            <View style={{ marginTop: 12, gap: 12 }}>
              <CardHeading>Card name</CardHeading>
              <Field
                label="Card name"
                placeholder="e.g. Apartment card"
                value={name}
                editable={!draft.locked}
                onChangeText={(value) => draft.update("name", value)}
                maxLength={80}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                style={{ borderRadius: 28 }}
                hideLabel
              />
            </View>
            <View style={{ marginTop: 16, gap: 12 }}>
              <CardHeading>Your card</CardHeading>
              <CardAppearancePicker
                name={name}
                identity={identity}
                design={design}
                disabled={draft.locked}
                expandedCategories={expandedCategories}
                onToggleCategory={(category) =>
                  setExpandedCategories((current) =>
                    current.includes(category)
                      ? current.filter((id) => id !== category)
                      : [...current, category],
                  )
                }
                onSelect={(value) => draft.update("design", value)}
              />
            </View>
          </>
        )}
        {step === 2 && (
          <>
            <CardHint>Choose the Circle this card belongs to.</CardHint>
            <View style={{ marginTop: 16, marginBottom: 4 }}>
              <CardHeading>Choose a Circle</CardHeading>
            </View>
            <ResourceState
              loading={circles.loading}
              data={circles.data}
              loadingKey={circles.loadingKey}
              error={circles.error}
              retry={circles.reload}
            />
            <CardCirclePicker
              circles={editableCircles}
              selectedId={selectedCircleId}
              disabled={draft.locked || !capabilityReady || action.busy}
              onSelect={(id) => {
                draft.update("circleId", id);
                if (id === null) setStep(afterCircle);
              }}
              onCreate={() => go("/create/circle")}
            />
          </>
        )}
        {step === 4 && (
          <>
            <ResourceState
              loading={accounts.loading}
              data={accounts.data}
              loadingKey={accounts.loadingKey}
              error={accounts.error}
              retry={accounts.reload}
            />
            {bankReady && (
              <CardBankStep
                accounts={accounts.data!.items}
                selectedId={draft.fields.betaAccountId}
                disabled={draft.locked || action.busy}
                onSelect={(id) => {
                  draft.update("betaAccountId", id);
                  setStep(4);
                }}
              />
            )}
          </>
        )}
        {step === 3 && (
          <>
            <CardCreationReview
              name={name}
              identity={identity}
              design={design}
              circleId={selectedCircleId}
              circleName={selectedCircle?.name}
              onChangeCircle={draft.locked ? undefined : () => setStep(2)}
            />
            {draft.fields.betaAccountId && (
              <View style={{ marginTop: 20, gap: 12 }}>
                <CardHint>
                  {selectedAccount
                    ? `${selectedAccount.name} ··${selectedAccount.last4}`
                    : "Saved sample account · details unavailable"}
                </CardHint>
                <CardHint>{betaBankNotice}</CardHint>
              </View>
            )}
          </>
        )}
      </AuthGate>
    </Shell>
  );
}
