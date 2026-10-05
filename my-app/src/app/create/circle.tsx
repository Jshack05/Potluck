import { useState } from "react";
import { View, Switch } from "react-native";
import { router, type Href, useLocalSearchParams } from "expo-router";
import {
  Shell,
  AuthGate,
  Avatar,
  Field,
  Title,
  Muted,
  Action,
  ErrorText,
  styles,
  theme,
} from "@/design/system";
import { useAction, useClient, useCommand } from "@/services/client";
import type { Circle } from "@/features/potluck/types";
export default function CreateCircle() {
  const { conversationId } = useLocalSearchParams<{
    conversationId?: string;
  }>();
  const { user } = useClient(),
    command = useCommand(),
    action = useAction();
  const [name, setName] = useState(""),
    [description, setDescription] = useState(""),
    [anonymous, setAnonymous] = useState(false);
  return (
    <Shell
      title="Create Circle"
      back
      footer={
        user && (
          <>
            <ErrorText text={action.error} />
            <Action
              label={action.busy ? "Creating…" : "Create Circle"}
              disabled={action.busy || !name.trim()}
              onPress={() =>
                action.run(async () => {
                  const circle = await command<Circle>("/circles", {
                    name,
                    description,
                    privacy: anonymous ? "anonymous" : "normal",
                  });
                  router.replace(
                    (conversationId
                      ? "/conversation/" + conversationId
                      : " /circle/" + circle.id
                    ).trim() as Href,
                  );
                })
              }
            />
          </>
        )
      }
    >
      <AuthGate returnTo="/create/circle">
        <View style={{ alignItems: "center", paddingVertical: 22 }}>
          <Avatar name={name || "C"} size={88} />
        </View>
        <Field
          label="Circle name"
          placeholder="e.g. Apartment crew"
          value={name}
          onChangeText={setName}
          maxLength={80}
        />
        <Field
          label="What brings you together? (optional)"
          placeholder="A few words about your Circle"
          value={description}
          onChangeText={setDescription}
          maxLength={400}
        />
        <Title>Privacy</Title>
        <View style={[styles.row, { justifyContent: "space-between" }]}>
          <View style={{ flex: 1, gap: 4 }}>
            <Muted>Anonymous Circle</Muted>
            <Muted>Members’ identities stay private from one another.</Muted>
          </View>
          <Switch
            accessibilityLabel="Anonymous Circle"
            value={anonymous}
            onValueChange={setAnonymous}
            trackColor={{ true: theme.teal }}
          />
        </View>
        <Muted>
          You’ll invite people after creating the Circle. Joining never commits
          someone to a payment.
        </Muted>
      </AuthGate>
    </Shell>
  );
}
