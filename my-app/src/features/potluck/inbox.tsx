import { View } from "react-native";
import {
  Shell,
  Title,
  Muted,
  Row,
  Empty,
  ResourceState,
  AuthGate,
  Avatar,
  ErrorText,
  Action,
  Link,
  go,
  styles,
} from "@/design/system";
import {
  useClient,
  useResource,
  useAction,
  useCommand,
} from "@/services/client";
import type {
  Collection,
  Conversation,
  ListingRequest,
  Invitation,
  Bill,
} from "./types";
export default function Inbox() {
  const { user } = useClient(),
    threads = useResource<Collection<Conversation>>(
      user ? "/conversations" : null,
    ),
    requests = useResource<Collection<ListingRequest>>(
      user ? "/requests" : null,
    ),
    invitations = useResource<Collection<Invitation>>(
      user ? "/invitations" : null,
    ),
    bills = useResource<Collection<Bill>>(user ? "/bills" : null),
    act = useAction(),
    command = useCommand();
  const transfers = useResource<{
    items: { id: string; circleName: string; senderName: string }[];
  }>(user ? "/circle-transfers" : null);
  const offers =
    bills.data?.items.flatMap((b) =>
      b.agreements
        .filter((a) => a.participantId === user?.id && a.status === "offered")
        .map((a) => ({ ...a, billName: b.name })),
    ) ?? [];
  async function respond(r: ListingRequest, action: string) {
    await act.run(async () => {
      const result = await command<{ id: string }>(
        "/requests/" + r.id + "/" + action,
        { expectedVersion: r.version },
      );
      await requests.reload();
      if (action === "accept") go("/conversation/" + result.id);
    });
  }
  return (
    <Shell title="Inbox" back>
      <AuthGate returnTo="/inbox">
        <ResourceState
          variant="messages"
          loading={
            (!threads.data && threads.loading) ||
            (!requests.data && requests.loading) ||
            (!invitations.data && invitations.loading) ||
            (!bills.data && bills.loading) ||
            (!transfers.data && transfers.loading)
          }
          error={
            threads.error ||
            requests.error ||
            invitations.error ||
            bills.error ||
            transfers.error
          }
          retry={() => {
            void threads.reload();
            void requests.reload();
            void invitations.reload();
            void bills.reload();
            void transfers.reload();
          }}
        />
        <ErrorText text={act.error} />
        {transfers.data?.items.map((t) => (
          <Row
            key={t.id}
            title={t.circleName}
            subtitle={"Hosting invitation from " + t.senderName}
            onPress={() => go("/circle-transfer/" + t.id)}
          />
        ))}
        {invitations.data?.items.length || offers.length ? (
          <Title>For you to review</Title>
        ) : null}
        {invitations.data?.items.map((i) => (
          <Row
            key={i.id}
            title={i.circleName}
            subtitle={"Circle invitation from " + i.senderName}
            icon="circles"
            onPress={() => go("/invitation/" + i.id)}
          />
        ))}
        {offers.map((a) => (
          <Row
            key={a.id}
            title={a.billName!}
            subtitle="Review your proposed share"
            icon="bills"
            onPress={() => go("/agreement/" + a.id)}
          />
        ))}
        {requests.data?.items
          .filter((r) => r.status === "pending")
          .map((r) => (
            <View key={r.id} style={{ paddingVertical: 12, gap: 12 }}>
              <View style={styles.row}>
                <Avatar name={r.requesterName} />
                <View style={{ flex: 1 }}>
                  <Title small>
                    {r.hostId === user?.id ? r.requesterName : "Your request"}
                  </Title>
                  <Muted>{r.listingTitle}</Muted>
                </View>
              </View>
              <Muted>{r.message}</Muted>
              {r.listingVersion !== r.currentListingVersion && (
                <Muted>
                  This listing has changed. A new request is needed after
                  reviewing the update.
                </Muted>
              )}
              {r.hostId === user?.id ? (
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Action
                      label="Open conversation"
                      disabled={
                        act.busy || r.listingVersion !== r.currentListingVersion
                      }
                      onPress={() => respond(r, "accept")}
                    />
                  </View>
                  <Link onPress={() => respond(r, "decline")}>Decline</Link>
                </View>
              ) : (
                <>
                  <Muted>Waiting for the host to respond.</Muted>
                  <Link onPress={() => respond(r, "withdraw")}>
                    Withdraw request
                  </Link>
                </>
              )}
            </View>
          ))}
        <Title>Conversations</Title>
        {threads.data?.items.map((c) => (
          <Row
            key={c.id}
            title={c.hostId === user?.id ? c.participantName : c.hostName}
            subtitle={c.listingTitle}
            onPress={() => go("/conversation/" + c.id)}
          />
        ))}
        {threads.data?.items.length === 0 && (
          <Empty
            title="A hello can start a Circle"
            detail="Your conversations will appear here when a host accepts your request, or someone reaches out about your listing."
            icon="inbox"
          />
        )}
        {requests.data?.items
          .filter((r) => ["declined", "withdrawn"].includes(r.status))
          .map((r) => (
            <Row
              key={r.id}
              title={r.listingTitle}
              subtitle={"Request " + r.status}
            />
          ))}
      </AuthGate>
    </Shell>
  );
}
