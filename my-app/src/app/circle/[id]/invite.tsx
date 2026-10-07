import { useState } from "react";
import { router, useLocalSearchParams, type Href } from "expo-router";
import {
  Shell,
  AuthGate,
  Muted,
  Field,
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
import { useCreationDraft } from "@/services/creation-draft";
import {
  CircleHeading,
  CirclePersonRow,
  CircleMenuRow,
} from "@/features/potluck/circle-ui";
import {
  canInviteToCircle,
  type CircleDetail,
  type CircleInvitation,
} from "@/features/potluck/circle-model";
export default function Invite() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { user } = useClient();
  return <InviteForm key={(user?.id ?? "guest") + id} id={id} />;
}
function InviteForm({ id }: { id: string }) {
  const { user } = useClient(),
    command = useCommand(),
    action = useAction(),
    resource = useResource<CircleDetail>(user ? "/circles/" + id : null),
    circle = resource.data;
  const [review, setReview] = useState(false),
    draft = useCreationDraft<{ email: string }, CircleInvitation>(
      user ? "potluck.draft.circle-invite." + user.id + "." + id : null,
      { email: "" },
    );
  const email = draft.fields.email.trim().toLowerCase(),
    reviewing = review || draft.resuming,
    allowed = circle && canInviteToCircle(circle);
  return (
    <Shell
      title="Potluck"
      continuation
      back
      active="Circles"
      onBack={reviewing && !draft.locked ? () => setReview(false) : undefined}
      footer={
        allowed && (
          <>
            <ErrorText text={action.error || draft.error} />
            {reviewing && !draft.locked && (
              <Action
                label="Edit recipient"
                secondary
                onPress={() => setReview(false)}
              />
            )}
            <Action
              label={
                action.busy
                  ? "Sending…"
                  : reviewing
                    ? "Send invitation"
                    : "Review invitation"
              }
              disabled={
                action.busy ||
                !draft.ready ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
              }
              onPress={() =>
                reviewing
                  ? action.run(async () => {
                      const invitation = await draft.submit(
                        { email },
                        (body, identity) =>
                          command<CircleInvitation>(
                            "/circles/" + id + "/invitations",
                            body,
                            identity,
                          ),
                      );
                      router.replace(("/invitation/" + invitation.id) as Href);
                      await draft.clear();
                    })
                  : setReview(true)
              }
            />
          </>
        )
      }
    >
      <AuthGate returnTo={"/circle/" + id + "/invite"}>
        <ResourceState {...resource} retry={resource.reload} />
        {allowed ? (
          reviewing ? (
            <>
              <CircleHeading>Send this invitation?</CircleHeading>
              <CirclePersonRow name={email} subtitle="Circle invitation" />
              <CircleMenuRow
                title={circle.name}
                detail={
                  circle.role !== "host" && circle.requireHostApproval
                    ? "Host approval required"
                    : "Member invitation"
                }
              />
              <Muted>
                {circle.privacy === "anonymous"
                  ? "Their identity will stay private from other members. The Circle Host remains visible."
                  : "They’ll be able to see the Circle and its members after accepting."}
              </Muted>
              <Muted>
                Contributions and spending permissions are agreed separately.
              </Muted>
            </>
          ) : (
            <>
              <CircleHeading>Make room for someone</CircleHeading>
              <Field
                label="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={draft.fields.email}
                editable={!draft.locked}
                onChangeText={(value) => draft.update("email", value)}
                placeholder="alex@example.com"
              />
              <Muted>We’ll invite them to {circle.name}.</Muted>
              <Muted>
                They choose whether to join. Accepting does not authorize
                contributions or spending.
              </Muted>
              <Muted>
                Invitations appear in their Potluck Inbox. They’ll need an
                account to receive one.
              </Muted>
            </>
          )
        ) : (
          circle && (
            <>
              <CircleHeading>
                Invitations are managed by your host
              </CircleHeading>
              <Muted>Your Circle Host can invite someone for you.</Muted>
            </>
          )
        )}
      </AuthGate>
    </Shell>
  );
}
