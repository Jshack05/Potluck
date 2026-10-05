import { useState } from "react";
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
  Label,
  theme,
} from "@/design/system";
import { useAction, useClient, useCommand } from "@/services/client";
import { CardPreview } from "@/features/potluck/card-preview";
import type { Card } from "@/features/potluck/types";
export default function CreateCard() {
  const { circleId } = useLocalSearchParams<{ circleId?: string }>(),
    { user } = useClient(),
    command = useCommand(),
    action = useAction();
  const [name, setName] = useState(""),
    [design, setDesign] = useState<Card["design"]>("aurora");
  return (
    <Shell
      title="Create card"
      back
      active="Cards"
      footer={
        user && (
          <>
            <ErrorText text={action.error} />
            <Action
              label={action.busy ? "Saving…" : "Create Card setup"}
              disabled={action.busy || !name.trim()}
              onPress={() =>
                action.run(async () => {
                  const card = await command<Card>("/cards", {
                    name,
                    design,
                    circleId: circleId ?? null,
                  });
                  router.replace(("/card/" + card.id) as Href);
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
          onChangeText={setName}
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
              onPress={() => setDesign(value)}
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
