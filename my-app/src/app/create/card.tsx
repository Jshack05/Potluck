import { View, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Shell,
  AuthGate,
  Field,
  Action,
  ErrorText,
  Link,
  Label,
  ResourceState,
  go,
  theme,
} from "@/design/system";
import { useCreationDraft } from "@/services/creation-draft";
import {
  useAction,
  useClient,
  useCommand,
  useResource,
} from "@/services/client";
import { CardPreview, cardLooks } from "@/features/potluck/card-preview";
import {
  CardCircleChoice,
  CardCreateCircle,
  CardReviewRow,
  CardSelection,
  CardHeading,
  CardHint,
} from "@/features/potluck/card-ui";
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
    },
    Card
  >(user ? "potluck.draft.card." + user.id + "." + (circleId ?? "new") : null, {
    name: "",
    design: "aurora",
    circleId: circleId ?? null,
    step: 0,
  });
  const circles = useResource<Collection<Circle>>(user ? "/circles" : null);
  const { name, design } = draft.fields;
  const selectedCircleId =
    draft.fields.circleId === undefined
      ? (circleId ?? null)
      : draft.fields.circleId;
  const selectedCircle = circles.data?.items.find(
    (c) => c.id === selectedCircleId,
  );
  const step = draft.resuming ? 3 : (draft.fields.step ?? 0);
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
        { name, design, circleId: selectedCircleId },
        (body, identity) => command<Card>("/cards", body, identity),
      );
      router.replace("/cards");
      await draft.clear();
    });
  }
  return (
    <Shell
      title={
        ["Create card", "Choose a card look", "Attach a Circle", "Review card"][
          step
        ]
      }
      back
      headerTitleSize={28}
      hideNavigation
      active="Cards"
      onBack={() => (step > 0 ? setStep(step - 1) : router.back())}
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
                    : "Continue"
              }
              disabled={
                action.busy ||
                !draft.ready ||
                !name.trim() ||
                (!draft.resuming &&
                  step >= 2 &&
                  !!selectedCircleId &&
                  !editableCircles.some((c) => c.id === selectedCircleId))
              }
              onPress={() => (step === 3 ? void save() : setStep(step + 1))}
            />
          </>
        )
      }
    >
      <AuthGate returnTo="/create/card">
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
                style={{ borderRadius: 28 }}
                hideLabel
              />
            </View>
            <View style={{ marginTop: 16, gap: 12 }}>
              <CardHeading>Your card</CardHeading>
              <CardPreview name={name} design={design} />
              <Label
                style={{
                  textAlign: "center",
                  color: theme.muted,
                  fontSize: 14,
                }}
              >
                {cardLooks[design]} selected
              </Label>
            </View>
          </>
        )}
        {step === 1 && (
          <>
            <CardHint>Pick a look that feels like yours.</CardHint>
            <CardPreview name={name} design={design} />
            <Label
              style={{
                textAlign: "center",
                color: theme.teal,
                fontFamily: "Inter_700Bold",
                fontSize: 14,
              }}
            >
              {cardLooks[design]}
            </Label>
            {(
              [
                ["Gradients", ["aurora_gradient", "sunset"]],
                ["Solid colors", ["teal", "coral"]],
                ["Potluck panels", ["ocean", "berry"]],
              ] as [string, Card["design"][]][]
            ).map(([title, looks]) => (
              <View key={title} style={{ gap: 8 }}>
                <Label
                  style={{
                    fontSize: 18,
                    lineHeight: 22,
                    fontFamily: "Inter_700Bold",
                  }}
                >
                  {title}
                </Label>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    gap: 20,
                  }}
                >
                  {looks.map((look) => (
                    <Pressable
                      key={look}
                      accessibilityLabel={cardLooks[look]}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: design === look }}
                      aria-checked={design === look}
                      disabled={draft.locked}
                      onPress={() => draft.update("design", look)}
                      style={{ flex: 1, maxWidth: 176 }}
                    >
                      <CardPreview name={name} design={look} compact />
                      <View style={{ position: "absolute", top: 8, right: 8 }}>
                        <CardSelection selected={design === look} light />
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
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
            <View style={{ gap: 12 }}>
              {editableCircles.map((circle) => (
                <CardCircleChoice
                  key={circle.id}
                  title={circle.name}
                  subtitle={`${circle.memberCount} ${circle.memberCount === 1 ? "member" : "members"}`}
                  disabled={draft.locked}
                  selected={selectedCircleId === circle.id}
                  onPress={() => draft.update("circleId", circle.id)}
                />
              ))}
              <CardCircleChoice
                title="No Circle — just for me"
                selected={!selectedCircleId}
                disabled={draft.locked}
                onPress={() => {
                  draft.update("circleId", null);
                  setStep(3);
                }}
              />
              <CardCreateCircle
                disabled={draft.locked}
                onPress={() => go("/create/circle")}
              />
            </View>
          </>
        )}
        {step === 3 && (
          <>
            <CardHint>
              {selectedCircleId
                ? "Confirm the card and invitations before you create it."
                : "Confirm this card will stay just for you."}
            </CardHint>
            <View style={{ marginTop: 16, gap: 16 }}>
              <CardHeading>
                {selectedCircleId ? "Your card" : "Card"}
              </CardHeading>
              <CardPreview name={name} design={design} />
              <Label
                style={{
                  textAlign: "center",
                  color: theme.muted,
                  fontSize: 14,
                  marginTop: 12,
                }}
              >
                {selectedCircleId
                  ? `${name} · host-controlled`
                  : "Card shell — no shared access"}
              </Label>
            </View>
            {selectedCircleId ? (
              <>
                <View style={{ marginTop: 20, gap: 12 }}>
                  <CardHeading>Attached Circle</CardHeading>
                  <CardReviewRow
                    title={selectedCircle?.name ?? "Circle unavailable"}
                    circle
                    onPress={draft.locked ? undefined : () => setStep(2)}
                  />
                </View>
                <CardHeading>Trusted Spender invitations</CardHeading>
                <CardReviewRow title="No invitations sent" />
                <CardHint>
                  Card access begins only after each person accepts their
                  invitation.
                </CardHint>
              </>
            ) : (
              <>
                <View style={{ marginTop: 20, gap: 12 }}>
                  <CardHeading>Sharing</CardHeading>
                  <CardReviewRow
                    title="Just for you"
                    subtitle="No Circle or invitations"
                  />
                </View>
                <View style={{ marginTop: 12 }}>
                  <CardHint>
                    You can attach a Circle later to invite Trusted Spenders.
                  </CardHint>
                </View>
              </>
            )}
          </>
        )}
      </AuthGate>
    </Shell>
  );
}
