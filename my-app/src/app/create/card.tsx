import { View, Pressable } from "react-native";
import { router, useLocalSearchParams, type Href } from "expo-router";
import {
  Shell,
  AuthGate,
  Title,
  Muted,
  Field,
  Action,
  ErrorText,
  Link,
  Label,
  ResourceState,
  Row,
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
  PlanningChoice,
  Selection,
} from "@/features/potluck/planning-controls";
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
      const card = await draft.submit(
        { name, design, circleId: selectedCircleId },
        (body, identity) => command<Card>("/cards", body, identity),
      );
      router.replace(("/card/" + card.id) as Href);
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
                      : "Create card setup"
                    : "Continue"
              }
              disabled={
                action.busy ||
                !draft.ready ||
                !name.trim() ||
                (step === 2 &&
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
            <Muted>
              Give your card a name and choose a virtual card design.
            </Muted>
            <Field
              label="Card name"
              placeholder="e.g. Apartment card"
              value={name}
              editable={!draft.locked}
              onChangeText={(value) => draft.update("name", value)}
              maxLength={80}
              style={{ borderRadius: 28 }}
            />
            <View style={{ marginTop: 12, gap: 12 }}>
              <Title small>Your card</Title>
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
            <Muted>Pick a look that feels like yours.</Muted>
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
                ["Artwork", ["aurora", "graphite"]],
              ] as [string, Card["design"][]][]
            ).map(([title, looks]) => (
              <View key={title} style={{ gap: 8 }}>
                <Title small>{title}</Title>
                <View style={{ flexDirection: "row", gap: 24 }}>
                  {looks.map((look) => (
                    <Pressable
                      key={look}
                      accessibilityLabel={cardLooks[look]}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: design === look }}
                      aria-checked={design === look}
                      disabled={draft.locked}
                      onPress={() => draft.update("design", look)}
                      style={{ flex: 1 }}
                    >
                      <CardPreview name={name} design={look} compact />
                      <View style={{ position: "absolute", top: 8, right: 8 }}>
                        <Selection selected={design === look} />
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
            <Muted>Choose the Circle this card belongs to.</Muted>
            <Title small>Choose a Circle</Title>
            <ResourceState
              loading={circles.loading}
              data={circles.data}
              loadingKey={circles.loadingKey}
              error={circles.error}
              retry={circles.reload}
            />
            {editableCircles.map((circle) => (
              <PlanningChoice
                key={circle.id}
                title={circle.name}
                subtitle={
                  circle.privacy === "anonymous"
                    ? "Anonymous Circle"
                    : "Accepted Circle"
                }
                name={circle.name}
                selected={selectedCircleId === circle.id}
                onPress={() => draft.update("circleId", circle.id)}
              />
            ))}
            <PlanningChoice
              title="No Circle — just for me"
              selected={!selectedCircleId}
              onPress={() => draft.update("circleId", null)}
            />
            <Row
              title="Create a new Circle"
              icon="plus"
              onPress={() => go("/create/circle")}
            />
          </>
        )}
        {step === 3 && (
          <>
            <Muted>Confirm the card and Circle before you create it.</Muted>
            <Title small>Your card</Title>
            <CardPreview name={name} design={design} />
            <Label
              style={{ textAlign: "center", color: theme.muted, fontSize: 14 }}
            >
              {name} · host-controlled
            </Label>
            <View style={{ marginTop: 20, gap: 12 }}>
              <Title small>Attached Circle</Title>
              <Row
                title={selectedCircle?.name ?? "No Circle — just for me"}
                icon="circles"
                onPress={draft.locked ? undefined : () => setStep(2)}
              />
            </View>
            <Title small>Trusted Spender invitations</Title>
            <Row
              title="No invitations sent"
              subtitle="Card access needs a separate invitation and issuer approval."
              onPress={() => go("/card/access-info")}
            />
            <Muted>
              Your setup is saved without issuing a Card or moving money. Circle
              membership does not grant card access.
            </Muted>
          </>
        )}
      </AuthGate>
    </Shell>
  );
}
