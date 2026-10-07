import { useLocalSearchParams } from "expo-router";
import {
  Shell,
  Muted,
  Action,
  Link,
  AuthGate,
  ResourceState,
  ErrorText,
  go,
} from "@/design/system";
import {
  useClient,
  useResource,
  useAction,
  useCommand,
} from "@/services/client";
import {
  circleInvitationState,
  type CircleTransfer,
} from "@/features/potluck/circle-model";
import {
  CircleHeading,
  CircleHero,
  CircleMenuRow,
  CirclePersonRow,
} from "@/features/potluck/circle-ui";
export default function HostingInvitation() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { user } = useClient(),
    resource = useResource<CircleTransfer>(
      user ? "/circle-transfers/" + id : null,
    ),
    action = useAction(),
    command = useCommand(),
    transfer = resource.data;
  const state = transfer ? circleInvitationState(transfer) : "",
    recipient = transfer?.recipientId === user?.id,
    sender = transfer?.senderId === user?.id;
  const respond = (intent: string) =>
    action.run(async () => {
      await command("/circle-transfers/" + id + "/" + intent, {
        expectedVersion: transfer!.version,
      });
      await resource.reload();
    });
  return (
    <Shell
      title="Potluck"
      continuation
      back
      active="Circles"
      footer={
        transfer && (
          <>
            <ErrorText text={action.error} />
            {state === "pending" && recipient ? (
              <>
                <Action
                  label="Decline"
                  secondary
                  disabled={action.busy}
                  onPress={() => respond("decline")}
                />
                <Action
                  label="Accept Circle Host role"
                  disabled={action.busy}
                  onPress={() => respond("accept")}
                />
              </>
            ) : (
              <Action
                label={state === "accepted" ? "View Circle" : "Back to Circle"}
                onPress={() => go("/circle/" + transfer.circleId + "/settings")}
              />
            )}
          </>
        )
      }
    >
      <AuthGate returnTo={"/circle-transfer/" + id}>
        <ResourceState {...resource} retry={resource.reload} />
        {transfer &&
          (state === "pending" ? (
            recipient ? (
              <>
                <CircleHeading>Become Circle Host?</CircleHeading>
                <CircleHero
                  detail={
                    transfer.senderName +
                    " asked you to host " +
                    transfer.circleName +
                    "."
                  }
                />
                <CircleMenuRow
                  title="Manage Circle membership"
                  detail="Handle invitations and member removal."
                />
                <CircleMenuRow
                  title="Manage Circle privacy"
                  detail="Help the group stay organized."
                  icon="lock"
                />
                <CircleHeading>Group responsibility only</CircleHeading>
                <Muted>
                  You will not become the owner of other people’s Cards, Bills
                  or funds.
                </Muted>
              </>
            ) : (
              <>
                <CircleHeading>
                  {transfer.recipientName} is reviewing your request
                </CircleHeading>
                <CirclePersonRow
                  name={transfer.recipientName}
                  subtitle="Circle Host handover pending"
                />
                <Muted>
                  You are still the Circle Host. Nothing changes until{" "}
                  {transfer.recipientName} accepts.
                </Muted>
                {sender && (
                  <Link
                    danger
                    onPress={() => {
                      if (!action.busy) void respond("revoke");
                    }}
                  >
                    Cancel handover request
                  </Link>
                )}
              </>
            )
          ) : (
            <>
              <CircleHero
                complete={state === "accepted" || state === "revoked"}
                title={
                  state === "accepted"
                    ? "Handover complete"
                    : state === "declined"
                      ? "Handover declined"
                      : state === "expired"
                        ? "Handover expired"
                        : "Handover canceled"
                }
                detail={
                  state === "accepted"
                    ? transfer.recipientName +
                      " is now Circle Host. " +
                      transfer.senderName +
                      " remains a member."
                    : "The Circle Host role is unchanged."
                }
              />
              <Muted>
                No Card, Bill, contribution or fund ownership changed.
              </Muted>
            </>
          ))}
      </AuthGate>
    </Shell>
  );
}
