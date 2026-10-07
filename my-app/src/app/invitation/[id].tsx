import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  Shell,
  AuthGate,
  Muted,
  Label,
  Action,
  ErrorText,
  ResourceState,
  Link,
  go,
  theme,
} from "@/design/system";
import {
  useAction,
  useClient,
  useCommand,
  useResource,
} from "@/services/client";
import {
  circleInvitationState,
  type CircleInvitation,
} from "@/features/potluck/circle-model";
import {
  CircleHeading,
  CircleHero,
  CirclePersonRow,
} from "@/features/potluck/circle-ui";
export default function InvitationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { user } = useClient(),
    command = useCommand(),
    action = useAction(),
    resource = useResource<CircleInvitation>(
      user ? "/invitations/" + id : null,
    ),
    invite = resource.data;
  const state = invite ? circleInvitationState(invite) : "",
    recipient = invite?.recipientId === user?.id,
    host = invite?.hostId === user?.id,
    sender = invite?.senderId === user?.id,
    pending = state === "pending",
    approval = state === "awaiting_host_approval";
  const respond = (intent: string) =>
    action.run(async () => {
      await command("/invitations/" + id + "/" + intent, {
        expectedVersion: invite!.version,
      });
      await resource.reload();
    });
  const back = () =>
    go(
      invite && (host || sender)
        ? "/circle/" + invite.circleId + "/members"
        : state === "accepted"
          ? "/circle/" + invite?.circleId
          : "/circles",
    );
  return (
    <Shell
      title="Potluck"
      continuation
      back
      active="Circles"
      footer={
        invite && (
          <>
            <ErrorText text={action.error} />
            {pending && recipient ? (
              <>
                <Action
                  label="Decline invitation"
                  secondary
                  disabled={action.busy}
                  onPress={() => respond("decline")}
                />
                <Action
                  label="Join Circle"
                  disabled={action.busy}
                  onPress={() => respond("accept")}
                />
              </>
            ) : approval && host ? (
              <>
                <Action
                  label="Cancel invitation"
                  secondary
                  disabled={action.busy}
                  onPress={() => respond("revoke")}
                />
                <Action
                  label="Approve invitation"
                  disabled={action.busy}
                  onPress={() => respond("approve")}
                />
              </>
            ) : (
              <Action
                label={
                  host || sender
                    ? "Back to members"
                    : state === "accepted"
                      ? "View Circle"
                      : "Back to Circles"
                }
                onPress={back}
              />
            )}
          </>
        )
      }
    >
      <AuthGate returnTo={"/invitation/" + id}>
        <ResourceState {...resource} retry={resource.reload} />
        {invite && (
          <>
            {pending || approval ? (
              <>
                <CircleHeading>
                  {approval
                    ? "Waiting for host approval"
                    : recipient
                      ? "You’re invited to " + invite.circleName
                      : "Waiting for " + invite.recipientName}
                </CircleHeading>
                <CirclePersonRow
                  name={recipient ? invite.senderName : invite.recipientName}
                  subtitle={
                    approval ? "Invitation suggested" : "Invitation pending"
                  }
                />
                {recipient ? (
                  <>
                    <Muted>
                      {invite.senderName} invited you to {invite.circleName}.
                    </Muted>
                    <Muted>
                      {invite.privacy === "anonymous"
                        ? "This is an anonymous Circle. Other members’ identities stay private; the Circle Host remains visible."
                        : "You’ll be able to see the people in this Circle after joining."}
                    </Muted>
                    <Muted>
                      Joining creates no contribution agreement or spending
                      permission.
                    </Muted>
                  </>
                ) : (
                  <>
                    {(approval
                      ? [
                          "Your suggestion has been sent to the Circle Host.",
                          "The host reviews the invitation.",
                          "They choose whether to join after approval.",
                        ]
                      : [
                          "Your invitation has been sent.",
                          invite.recipientName + " chooses whether to join.",
                          "Membership updates after acceptance.",
                        ]
                    ).map((step, index) => (
                      <View
                        key={step}
                        style={{
                          flexDirection: "row",
                          gap: 14,
                          paddingVertical: 10,
                          alignItems: "flex-start",
                        }}
                      >
                        <View
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: index ? "white" : theme.mint,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Label style={{ color: theme.teal }}>
                            {index + 1}
                          </Label>
                        </View>
                        <Label
                          style={{ flex: 1, fontSize: 15, lineHeight: 22 }}
                        >
                          {step}
                        </Label>
                      </View>
                    ))}
                    {(host || sender) && (
                      <Link
                        danger
                        onPress={() => {
                          if (!action.busy) void respond("revoke");
                        }}
                      >
                        Cancel invitation
                      </Link>
                    )}
                  </>
                )}
              </>
            ) : (
              <CircleHero
                complete={state === "accepted" || state === "revoked"}
                title={
                  state === "accepted"
                    ? "Welcome to the Circle"
                    : state === "declined"
                      ? "Invitation declined"
                      : state === "expired"
                        ? "Invitation expired"
                        : "Invitation canceled"
                }
                detail={
                  state === "accepted"
                    ? recipient
                      ? "You joined " + invite.circleName + "."
                      : invite.recipientName + " joined the Circle."
                    : state === "declined"
                      ? "The invitation was declined. No membership was created."
                      : "This invitation is no longer active."
                }
              />
            )}
          </>
        )}
      </AuthGate>
    </Shell>
  );
}
