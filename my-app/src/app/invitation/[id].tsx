import { useLocalSearchParams, router, type Href } from "expo-router";
import {
  Shell,
  AuthGate,
  Empty,
  Muted,
  Action,
  ErrorText,
  ResourceState,
} from "@/design/system";
import {
  useAction,
  useClient,
  useCommand,
  useResource,
} from "@/services/client";
import type { Collection, Invitation } from "@/features/potluck/types";
export default function InvitationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { user } = useClient(),
    command = useCommand(),
    action = useAction(),
    resource = useResource<Collection<Invitation>>(
      user ? "/invitations" : null,
    );
  const invite = resource.data?.items.find((item) => item.id === id);
  return (
    <Shell
      title="Circle invitation"
      back
      footer={
        invite && (
          <>
            <ErrorText text={action.error} />
            <Action
              label="Join Circle"
              disabled={action.busy}
              onPress={() =>
                action.run(async () => {
                  await command("/invitations/" + id + "/accept", {
                    expectedVersion: invite.version,
                  });
                  router.replace(("/circle/" + invite.circleId) as Href);
                })
              }
            />
            <Action
              label="Decline invitation"
              secondary
              disabled={action.busy}
              onPress={() =>
                action.run(async () => {
                  await command("/invitations/" + id + "/decline", {
                    expectedVersion: invite.version,
                  });
                  router.replace("/inbox");
                })
              }
            />
          </>
        )
      }
    >
      <AuthGate returnTo={"/invitation/" + id}>
        <ResourceState
          loading={resource.loading}
          error={resource.error}
          retry={resource.reload}
        />
        {invite ? (
          <>
            <Empty
              title={invite.circleName}
              detail={invite.senderName + " invited you to join their Circle."}
            />
            <Muted>
              Joining connects you with the group. You’ll review any Bill
              contribution or Card permission separately.
            </Muted>
          </>
        ) : (
          resource.data && (
            <Empty
              title="Invitation unavailable"
              detail="It may have expired, been withdrawn, or already been answered."
            />
          )
        )}
      </AuthGate>
    </Shell>
  );
}
