import { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  Shell,
  AuthGate,
  Muted,
  Label,
  Link,
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
import type { Collection, Person } from "@/features/potluck/types";
import {
  canInviteToCircle,
  circleInvitationState,
  type CircleDetail,
  type CircleInvitation,
} from "@/features/potluck/circle-model";
import {
  CircleHeading,
  CirclePersonRow,
  circleStyles,
} from "@/features/potluck/circle-ui";
export default function CircleMembers() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { user } = useClient(),
    resource = useResource<CircleDetail>(user ? "/circles/" + id : null),
    invitations = useResource<Collection<CircleInvitation>>(
      user ? "/circles/" + id + "/invitations" : null,
    ),
    circle = resource.data,
    action = useAction(),
    command = useCommand(),
    [remove, setRemove] = useState<Person | null>(null);
  return (
    <Shell
      title="Potluck"
      continuation
      back
      active="Circles"
      onBack={remove ? () => setRemove(null) : undefined}
      footer={
        circle && (
          <>
            <ErrorText text={action.error} />
            {remove ? (
              <>
                <Action
                  label="Keep member"
                  secondary
                  disabled={action.busy}
                  onPress={() => setRemove(null)}
                />
                <Action
                  label="Remove from Circle"
                  danger
                  disabled={action.busy}
                  onPress={() =>
                    action.run(async () => {
                      await command("/circles/" + id + "/remove", {
                        userId: remove.id,
                        expectedVersion: circle.version,
                        acknowledged: true,
                      });
                      setRemove(null);
                      resource.reload();
                      invitations.reload();
                    })
                  }
                />
              </>
            ) : (
              canInviteToCircle(circle) && (
                <Action
                  label="Invite someone"
                  onPress={() => go("/circle/" + id + "/invite")}
                />
              )
            )}
          </>
        )
      }
    >
      <AuthGate returnTo={"/circle/" + id + "/members"}>
        <ResourceState {...resource} retry={resource.reload} />
        {circle &&
          (remove ? (
            <>
              <CircleHeading>Remove {remove.name}?</CircleHeading>
              <CirclePersonRow name={remove.name} subtitle="Circle member" />
              <Muted>
                They’ll lose access to this Circle. Their separate Cards, Bills
                and contribution agreements stay in place until handled through
                their own controls.
              </Muted>
            </>
          ) : (
            <>
              <CircleHeading>People in your Circle</CircleHeading>
              {circle.people.map((person) => (
                <CirclePersonRow
                  key={person.id}
                  name={person.id === user?.id ? "You" : person.name}
                  subtitle={
                    person.id === circle.hostId ? "Circle Host" : "Member"
                  }
                  trailing={
                    circle.role === "host" && person.id !== user?.id ? (
                      <Link danger onPress={() => setRemove(person)}>
                        Remove
                      </Link>
                    ) : undefined
                  }
                />
              ))}
              {circle.privacy === "anonymous" && circle.role !== "host" && (
                <Muted>
                  Other members stay private. Your Circle Host is shown above.
                </Muted>
              )}
              <View style={circleStyles.divider} />
              <Label style={{ fontSize: 20, fontFamily: "Inter_700Bold" }}>
                Invitations
              </Label>
              <ResourceState {...invitations} retry={invitations.reload} />
              {invitations.data?.items.map((invite) => (
                <CirclePersonRow
                  key={invite.id}
                  name={invite.recipientName}
                  subtitle={
                    (
                      {
                        pending: "Invitation pending",
                        awaiting_host_approval: "Needs host approval",
                        accepted: "Joined Circle",
                        declined: "Declined",
                        revoked: "Canceled",
                        expired: "Expired",
                      } as Record<string, string>
                    )[circleInvitationState(invite)]
                  }
                  onPress={() => go("/invitation/" + invite.id)}
                />
              ))}
              {invitations.data?.items.length === 0 && (
                <Muted>No invitations to review.</Muted>
              )}
            </>
          ))}
      </AuthGate>
    </Shell>
  );
}
