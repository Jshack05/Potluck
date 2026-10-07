import { useState } from "react";
import { View, Pressable, ScrollView } from "react-native";
import { router, type Href, useLocalSearchParams } from "expo-router";
import { useCreationDraft } from "@/services/creation-draft";
import { creationPath } from "@/services/navigation";
import {
  Shell,
  AuthGate,
  Field,
  Section,
  Label,
  Muted,
  Action,
  ErrorText,
  Link,
  theme,
} from "@/design/system";
import { useAction, useClient, useCommand } from "@/services/client";
import {
  AddCirclePeople,
  CircleArtwork,
  CircleAvatar,
  CircleSetting,
  CircleSheet,
  circleColors,
} from "@/features/potluck/circle-ui";
import {
  recipientKey,
  removeCircleRecipient,
  type CircleDetail,
  type CircleRecipient,
} from "@/features/potluck/circle-model";

type Draft = {
  name: string;
  description: string;
  anonymous: boolean;
  people: CircleRecipient[];
  color: keyof typeof circleColors;
  membersCanInvite: boolean;
  requireHostApproval: boolean;
};
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
    }>(),
    { user } = useClient(),
    command = useCommand(),
    action = useAction();
  const [peopleOpen, setPeopleOpen] = useState(false),
    [appearanceOpen, setAppearanceOpen] = useState(false);
  const draft = useCreationDraft<Draft, CircleDetail>(
    user
      ? "potluck.draft.circle." + user.id + "." + (conversationId ?? "new")
      : null,
    {
      name: "",
      description: "",
      anonymous: false,
      people: [],
      color: "lilac",
      membersCanInvite: true,
      requireHostApproval: true,
    },
  );
  const {
    name,
    description,
    anonymous,
    people = [],
    color = "lilac",
    membersCanInvite = true,
    requireHostApproval = true,
  } = draft.fields;
  return (
    <Shell
      title="Create Circle"
      back
      active="Circles"
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
                      icon: "circles",
                      color,
                      membersCanInvite,
                      requireHostApproval,
                      invitedUserIds: people
                        .filter((p) => p.id)
                        .map((p) => p.id),
                      invitedEmails: people
                        .filter((p) => !p.id && p.email)
                        .map((p) => p.email),
                    },
                    (body, identity) =>
                      command<CircleDetail>("/circles", body, identity),
                  );
                  router.replace(
                    (conversationId
                      ? "/conversation/" + conversationId
                      : "/circle/" + circle.id) as Href,
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
        <View
          style={{
            alignItems: "center",
            paddingTop: 8,
            paddingBottom: 10,
            gap: 8,
          }}
        >
          <CircleArtwork color={color} />
          <Pressable
            accessibilityRole="button"
            disabled={draft.locked}
            onPress={() => setAppearanceOpen(true)}
            style={{ minHeight: 44, justifyContent: "center" }}
          >
            <Label
              style={{
                color: theme.teal,
                textDecorationLine: "underline",
                fontSize: 13,
                fontFamily: "Inter_600SemiBold",
              }}
            >
              Change image icon
            </Label>
          </Pressable>
        </View>
        <Field
          label="Circle name"
          placeholder="Name your circle"
          value={name}
          editable={!draft.locked}
          onChangeText={(value) => draft.update("name", value)}
          maxLength={80}
        />
        <Section title="People" />
        <View
          style={{
            borderRadius: 24,
            backgroundColor: "white",
            minHeight: 112,
            paddingVertical: 16,
            paddingHorizontal: 20,
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
          >
            {people.map((person, index) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={"Remove " + person.name}
                disabled={draft.locked}
                key={recipientKey(person)}
                onPress={() =>
                  draft.update("people", removeCircleRecipient(people, person))
                }
                style={{ width: 72, alignItems: "center", gap: 5 }}
              >
                <CircleAvatar name={person.name} index={index + 1} />
                <Label
                  numberOfLines={1}
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_700Bold",
                    maxWidth: 72,
                  }}
                >
                  {person.name}
                </Label>
                <Label style={{ fontSize: 11, color: theme.muted }}>
                  To invite
                </Label>
              </Pressable>
            ))}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add people"
              disabled={draft.locked}
              onPress={() => setPeopleOpen(true)}
              style={{ width: 64, gap: 6, alignItems: "center" }}
            >
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: "#F2FAF7",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Label style={{ color: theme.teal, fontSize: 25 }}>+</Label>
              </View>
              <Label
                style={{
                  fontSize: 12,
                  color: theme.teal,
                  fontFamily: "Inter_700Bold",
                }}
              >
                Add
              </Label>
            </Pressable>
          </ScrollView>
        </View>
        <Section title="Settings" />
        <View
          style={{
            borderRadius: 24,
            backgroundColor: "white",
            paddingHorizontal: 20,
          }}
        >
          <CircleSetting
            title="Members can invite people"
            detail={
              anonymous
                ? "Anonymous Circles keep invitations with the host."
                : "Let members suggest people for this Circle."
            }
            value={membersCanInvite && !anonymous}
            onChange={(value) => draft.update("membersCanInvite", value)}
            disabled={draft.locked || anonymous}
          />
          <CircleSetting
            title="Require host approval"
            detail="New members need approval before joining."
            value={requireHostApproval}
            onChange={(value) => draft.update("requireHostApproval", value)}
            disabled={draft.locked}
          />
          <CircleSetting
            title="Anonymous circle"
            detail="Members stay private from one another."
            value={anonymous}
            onChange={(value) => draft.update("anonymous", value)}
            disabled={draft.locked}
            last
          />
        </View>
        <AddCirclePeople
          visible={peopleOpen}
          people={people}
          onChange={(value) => draft.update("people", value)}
          onClose={() => setPeopleOpen(false)}
        />
        <CircleSheet
          visible={appearanceOpen}
          onClose={() => setAppearanceOpen(false)}
        >
          <Label style={{ fontSize: 24, fontFamily: "Inter_700Bold" }}>
            Circle image icon
          </Label>
          <Muted>Choose a color for your Circle’s original people icon.</Muted>
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              justifyContent: "space-around",
              flexWrap: "wrap",
              paddingVertical: 14,
            }}
          >
            {(Object.keys(circleColors) as (keyof typeof circleColors)[]).map(
              (value) => (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityLabel={value + " Circle icon"}
                  accessibilityState={{ checked: color === value }}
                  aria-checked={color === value}
                  key={value}
                  onPress={() => draft.update("color", value)}
                  style={{
                    borderWidth: 2,
                    borderColor: color === value ? theme.teal : "transparent",
                    borderRadius: 50,
                    padding: 4,
                  }}
                >
                  <CircleArtwork color={value} />
                </Pressable>
              ),
            )}
          </View>
          <Action
            label="Use this icon"
            onPress={() => setAppearanceOpen(false)}
          />
        </CircleSheet>
      </AuthGate>
    </Shell>
  );
}
