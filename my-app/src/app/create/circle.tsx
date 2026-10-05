import { useCreationDraft } from "@/services/creation-draft";
import { creationPath } from "@/services/navigation";
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
  Link,
  styles,
  theme,
} from "@/design/system";
import { useAction, useClient, useCommand } from "@/services/client";
import type { Circle } from "@/features/potluck/types";
export default function CreateCircle() {
  const { user } = useClient(),
    { conversationId } = useLocalSearchParams<{ conversationId?: string }>();
  return (
    <CircleForm key={(user?.id ?? "guest") + ":" + (conversationId ?? "new")} />
  );
}
function CircleForm() {
  const { conversationId } = useLocalSearchParams<{
    conversationId?: string;
  }>();
  const { user } = useClient(),
    command = useCommand(),
    action = useAction();
  const draft = useCreationDraft<
    { name: string; description: string; anonymous: boolean },
    Circle
  >(
    user
      ? "potluck.draft.circle." + user.id + "." + (conversationId ?? "new")
      : null,
    { name: "", description: "", anonymous: false },
  );
  const { name, description, anonymous } = draft.fields;
  return (
    <Shell
      title="Create Circle"
      back
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
                  ? "Creating…"
                  : draft.resuming
                    ? "Finish creating Circle"
                    : "Create Circle"
              }
              disabled={action.busy || !draft.ready || !name.trim()}
              onPress={() =>
                action.run(async () => {
                  const circle = await draft.submit(
                    {
                      name,
                      description,
                      privacy: anonymous ? "anonymous" : "normal",
                    },
                    (body, identity) =>
                      command<Circle>("/circles", body, identity),
                  );
                  router.replace(
                    (conversationId
                      ? "/conversation/" + conversationId
                      : " /circle/" + circle.id
                    ).trim() as Href,
                  );
                  await draft.clear();
                })
              }
            />
          </>
        )
      }
    >
      <AuthGate returnTo={creationPath("/create/circle", { conversationId })}>
        <View style={{ alignItems: "center", paddingVertical: 22 }}>
          <Avatar name={name || "C"} size={88} />
        </View>
        <Field
          label="Circle name"
          placeholder="e.g. Apartment crew"
          value={name}
          editable={!draft.locked}
          onChangeText={(value) => draft.update("name", value)}
          maxLength={80}
        />
        <Field
          label="What brings you together? (optional)"
          placeholder="A few words about your Circle"
          value={description}
          editable={!draft.locked}
          onChangeText={(value) => draft.update("description", value)}
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
            disabled={draft.locked}
            onValueChange={(value) => draft.update("anonymous", value)}
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
