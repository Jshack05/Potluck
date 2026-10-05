import { useLocalSearchParams, router, type Href } from "expo-router";
import {
  Shell,
  Title,
  Muted,
  Action,
  Link,
  AuthGate,
  ResourceState,
  Empty,
  ErrorText,
} from "@/design/system";
import {
  useClient,
  useResource,
  useAction,
  useCommand,
} from "@/services/client";
type Transfer = {
  id: string;
  circleId: string;
  circleName: string;
  senderName: string;
  version: number;
};
export default function HostingInvitation() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { user } = useClient(),
    r = useResource<{ items: Transfer[] }>(user ? "/circle-transfers" : null),
    act = useAction(),
    command = useCommand(),
    t = r.data?.items.find((x) => x.id === id);
  return (
    <Shell
      title="Circle hosting"
      back
      footer={
        t && (
          <>
            <ErrorText text={act.error} />
            <Action
              label="Accept Circle hosting"
              disabled={act.busy}
              onPress={() =>
                act.run(async () => {
                  await command("/circle-transfers/" + id + "/accept", {
                    expectedVersion: t.version,
                  });
                  router.replace(("/circle/" + t.circleId) as Href);
                })
              }
            />
            <Link
              onPress={() =>
                act.run(async () => {
                  await command("/circle-transfers/" + id + "/decline", {
                    expectedVersion: t.version,
                  });
                  router.replace("/inbox");
                })
              }
            >
              Decline invitation
            </Link>
          </>
        )
      }
    >
      <AuthGate returnTo={"/circle-transfer/" + id}>
        <ResourceState {...r} retry={r.reload} />
        {t ? (
          <>
            <Title>{t.circleName}</Title>
            <Muted>{t.senderName} invited you to become Circle Host.</Muted>
            <Title small>Bring your people together</Title>
            <Muted>
              You’ll manage Circle membership and privacy. Bills and Cards
              retain their existing hosts, owners, permissions and agreements.
              This does not make you responsible for someone else’s Card or
              grant financial access.
            </Muted>
          </>
        ) : (
          !r.loading && (
            <Empty
              title="Invitation no longer available"
              detail="It may have expired or already been answered."
            />
          )
        )}
      </AuthGate>
    </Shell>
  );
}
