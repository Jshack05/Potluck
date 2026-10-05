import { useCreationDraft } from "@/services/creation-draft";
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
  theme,
} from "@/design/system";
import { useAction, useClient, useCommand } from "@/services/client";
import { CardPreview } from "@/features/potluck/card-preview";
import type { Card } from "@/features/potluck/types";
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
    { name: string; design: Card["design"] },
    Card
  >(user ? "potluck.draft.card." + user.id + "." + (circleId ?? "new") : null, {
    name: "",
    design: "aurora",
  });
  const { name, design } = draft.fields;
  return (
    <Shell
      title="Create card"
      back
      active="Cards"
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
                  : draft.resuming
                    ? "Finish Card setup"
                    : "Create Card setup"
              }
              disabled={action.busy || !draft.ready || !name.trim()}
              onPress={() =>
                action.run(async () => {
                  const card = await draft.submit(
                    {
                      name,
                      design,
                      circleId: circleId ?? null,
                    },
                    (body, identity) => command<Card>("/cards", body, identity),
                  );
                  router.replace(("/card/" + card.id) as Href);
                  await draft.clear();
                })
              }
            />
          </>
        )
      }
    >
      <AuthGate
        returnTo={"/create/card" + (circleId ? "?circleId=" + circleId : "")}
      >
        <Muted>Give your Card a name and choose a design.</Muted>
        <Field
          label="Card name"
          placeholder="e.g. Apartment card"
          value={name}
          editable={!draft.locked}
          onChangeText={(value) => draft.update("name", value)}
          maxLength={80}
        />
        <Title>Your card</Title>
        <CardPreview name={name} design={design} />
        <View
          style={{ flexDirection: "row", justifyContent: "center", gap: 12 }}
        >
          {(["aurora", "graphite", "teal"] as const).map((value) => (
            <Pressable
              key={value}
              accessibilityRole="radio"
              accessibilityState={{ checked: design === value }}
              aria-checked={design === value}
              disabled={draft.locked}
              onPress={() => draft.update("design", value)}
              style={{
                minHeight: 48,
                borderRadius: 24,
                padding: 12,
                backgroundColor: design === value ? theme.mint : "white",
              }}
            >
              <Label style={{ textTransform: "capitalize" }}>{value}</Label>
            </Pressable>
          ))}
        </View>
        <Muted>
          Your setup is saved without issuing a Card or moving money.
        </Muted>
      </AuthGate>
    </Shell>
  );
}
