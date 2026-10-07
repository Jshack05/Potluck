import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  Shell,
  AuthGate,
  Muted,
  Action,
  ResourceState,
  go,
} from "@/design/system";
import { useClient, useResource } from "@/services/client";
import type { Collection } from "@/features/potluck/types";
import {
  canInviteToCircle,
  type CircleDetail,
  type CircleTransfer,
} from "@/features/potluck/circle-model";
import {
  CircleHeading,
  CircleHero,
  CircleMenuRow,
} from "@/features/potluck/circle-ui";
export default function CircleSettings() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { user } = useClient(),
    resource = useResource<CircleDetail>(user ? "/circles/" + id : null),
    transfers = useResource<Collection<CircleTransfer>>(
      user ? "/circles/" + id + "/transfers" : null,
    ),
    circle = resource.data;
  const pending = transfers.data?.items.find((t) => t.status === "pending");
  const lastTransfer = transfers.data?.items[0];
  return (
    <Shell
      title="Potluck"
      continuation
      back
      active="Circles"
      footer={
        circle && (
          <>
            <Action
              label="Leave Circle"
              secondary
              onPress={() => go("/circle/" + id + "/leave")}
            />
            {canInviteToCircle(circle) && (
              <Action
                label="Invite someone"
                onPress={() => go("/circle/" + id + "/invite")}
              />
            )}
          </>
        )
      }
    >
      <AuthGate returnTo={"/circle/" + id + "/settings"}>
        <ResourceState {...resource} retry={resource.reload} />
        {circle && (
          <>
            <CircleHeading>{circle.name}</CircleHeading>
            <CircleHero
              title="Good people, shared plans"
              detail={
                (circle.memberCount ?? circle.people.length) +
                " people · " +
                (circle.role === "host"
                  ? "You’re the Circle Host"
                  : "You’re a Circle member")
              }
            />
            <View style={{ gap: 14 }}>
              <CircleMenuRow
                title="Members & invitations"
                detail="Manage who belongs to this Circle."
                onPress={() => go("/circle/" + id + "/members")}
              />
              <CircleMenuRow
                title="Circle Host"
                icon="shield"
                detail={
                  pending
                    ? "Handover pending"
                    : circle.role === "host"
                      ? "You · Manage a handover"
                      : (circle.people.find((p) => p.id === circle.hostId)
                          ?.name ?? "Your Circle Host")
                }
                onPress={
                  circle.role === "host" || pending
                    ? () =>
                        go(
                          pending
                            ? "/circle-transfer/" + pending.id
                            : "/circle/" + id + "/handover",
                        )
                    : undefined
                }
              />
              <CircleMenuRow
                title="Circle privacy"
                icon="lock"
                detail={
                  circle.privacy === "anonymous"
                    ? "Members’ identities stay private."
                    : "Members can see each other."
                }
                onPress={() => go("/circle/" + id + "/privacy")}
              />
            </View>
            <Muted>
              Circle membership doesn’t grant Card access or create a
              contribution agreement.
            </Muted>
            {circle.role === "host" && (
              <CircleMenuRow
                title="Circle details"
                detail="Name and invitation settings"
                onPress={() => go("/circle/" + id + "/privacy?edit=true")}
              />
            )}
            {!pending && lastTransfer && (
              <CircleMenuRow
                title="Last host handover"
                detail={
                  lastTransfer.status === "revoked"
                    ? "Canceled"
                    : lastTransfer.status
                }
                icon="shield"
                onPress={() => go("/circle-transfer/" + lastTransfer.id)}
              />
            )}
            {circle.role === "host" && (
              <CircleMenuRow
                title="Archive Circle"
                detail="Keep its history and close new invitations"
                onPress={() => go("/circle/" + id + "/leave?archive=true")}
              />
            )}
          </>
        )}
      </AuthGate>
    </Shell>
  );
}
