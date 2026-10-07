import { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import {
  Shell,
  AuthGate,
  Muted,
  Label,
  Field,
  Action,
  ErrorText,
  ResourceState,
  go,
} from "@/design/system";
import {
  useAction,
  useClient,
  useCommand,
  useResource,
} from "@/services/client";
import type { CircleDetail } from "@/features/potluck/circle-model";
import {
  CircleHeading,
  CircleMenuRow,
  CircleSetting,
} from "@/features/potluck/circle-ui";
export default function CirclePrivacy() {
  const { id, edit } = useLocalSearchParams<{ id: string; edit?: string }>(),
    { user } = useClient(),
    resource = useResource<CircleDetail>(user ? "/circles/" + id : null);
  return resource.data ? (
    <PrivacyEditor
      key={resource.data.id + ":" + resource.data.version}
      circle={resource.data}
      edit={edit === "true"}
    />
  ) : (
    <Shell title="Potluck" continuation back>
      <AuthGate returnTo={"/circle/" + id + "/privacy"}>
        <ResourceState {...resource} retry={resource.reload} />
      </AuthGate>
    </Shell>
  );
}
function PrivacyEditor({
  circle,
  edit,
}: {
  circle: CircleDetail;
  edit: boolean;
}) {
  const [name, setName] = useState(circle.name),
    [description, setDescription] = useState(circle.description),
    [anonymous, setAnonymous] = useState(circle.privacy === "anonymous"),
    [membersCanInvite, setMembersCanInvite] = useState(circle.membersCanInvite),
    [requireHostApproval, setRequireHostApproval] = useState(
      circle.requireHostApproval,
    ),
    [editing, setEditing] = useState(edit),
    command = useCommand(),
    action = useAction();
  const host = circle.role === "host";
  return (
    <Shell
      title="Potluck"
      continuation
      back
      active="Circles"
      footer={
        <>
          <ErrorText text={action.error} />
          {host && editing ? (
            <Action
              label="Save changes"
              disabled={action.busy || !name.trim()}
              onPress={() =>
                action.run(async () => {
                  await command("/circles/" + circle.id + "/edit", {
                    name,
                    description,
                    privacy: anonymous ? "anonymous" : "normal",
                    icon: circle.icon,
                    color: circle.color,
                    membersCanInvite,
                    requireHostApproval,
                    expectedVersion: circle.version,
                  });
                  router.back();
                })
              }
            />
          ) : (
            <Action
              label="Back to Circle"
              onPress={() => go("/circle/" + circle.id + "/settings")}
            />
          )}
        </>
      }
    >
      <CircleHeading>
        {editing ? "Circle details" : "Circle visibility"}
      </CircleHeading>
      {editing && host ? (
        <>
          <Field
            label="Circle name"
            value={name}
            onChangeText={setName}
            maxLength={80}
          />
          <Field
            label="About your Circle"
            value={description}
            onChangeText={setDescription}
            maxLength={400}
          />
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 24,
              paddingHorizontal: 20,
            }}
          >
            <CircleSetting
              title="Members can invite people"
              detail={
                anonymous
                  ? "Anonymous invitations stay with the host."
                  : "Let members suggest people for this Circle."
              }
              value={membersCanInvite && !anonymous}
              onChange={setMembersCanInvite}
              disabled={anonymous}
            />
            <CircleSetting
              title="Require host approval"
              detail="Suggested invitations need your approval."
              value={requireHostApproval}
              onChange={setRequireHostApproval}
            />
            <CircleSetting
              title="Anonymous Circle"
              detail="The Circle Host remains visible to members."
              value={anonymous}
              onChange={setAnonymous}
              last
            />
          </View>
          <Muted>
            Privacy changes never grant access to Cards, Bills or private
            contribution details.
          </Muted>
        </>
      ) : (
        <>
          <Label style={{ fontSize: 20, fontFamily: "Inter_700Bold" }}>
            Who can see the people here?
          </Label>
          <CircleMenuRow
            title={
              circle.privacy === "anonymous"
                ? "Members stay private"
                : "Members see each other"
            }
            detail={
              circle.privacy === "anonymous"
                ? "The host can see members. Members see themselves and the Circle Host."
                : "Names are visible within the Circle."
            }
          />
          <Muted>
            This setting does not publish the Circle as a Splitfinder listing.
          </Muted>
          {host && (
            <CircleMenuRow
              title="Change Circle settings"
              detail="Privacy and invitation permissions"
              icon="lock"
              onPress={() => setEditing(true)}
            />
          )}
        </>
      )}
    </Shell>
  );
}
