import { useState } from "react";
import { useLocalSearchParams, router, type Href } from "expo-router";
import {
  Shell,
  Title,
  Label,
  Muted,
  Action,
  Link,
  Row,
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
import type { Bill, Card, Circle, Collection } from "@/features/potluck/types";
export default function Manage() {
  const { type, id } = useLocalSearchParams<{ type: string; id: string }>(),
    { user } = useClient(),
    valid = type === "bills" || type === "cards" || type === "circles",
    r = useResource<Bill | Card | Circle>(
      user && valid ? "/" + type + "/" + id : null,
    ),
    circles = useResource<Collection<Circle>>(user ? "/circles" : null),
    cards = useResource<Collection<Card>>(user ? "/cards" : null),
    act = useAction(),
    command = useCommand();
  const [intent, setIntent] = useState<"connect" | "end" | "leave" | null>(
      null,
    ),
    [circleId, setCircle] = useState<string | null | undefined>(undefined),
    [cardId, setCard] = useState<string | null | undefined>(undefined);
  const item = r.data,
    owned = item?.hostId === user?.id;
  const submit = () =>
    act.run(async () => {
      if (!item) return;
      if (intent === "connect") {
        await command("/" + type + "/" + id + "/connection", {
          expectedVersion: item.version,
          ...(type === "bills"
            ? { expectedConnectionVersion: (item as Bill).connectionVersion }
            : {}),
          circleId:
            circleId === undefined
              ? "circleId" in item
                ? item.circleId
                : null
              : circleId,
          ...(type === "bills"
            ? { cardId: cardId === undefined ? (item as Bill).cardId : cardId }
            : {}),
        });
        router.back();
      } else {
        await command(
          "/" +
            type +
            "/" +
            id +
            "/" +
            (type === "bills" ? "end" : type === "cards" ? "close" : "leave"),
          { expectedVersion: item.version, acknowledged: true },
        );
        router.replace(("/" + type) as Href);
      }
    });
  return (
    <Shell
      title="Manage arrangement"
      back
      footer={
        item && intent ? (
          <>
            <ErrorText text={act.error} />
            <Action
              label={
                intent === "connect"
                  ? "Save connection"
                  : intent === "leave"
                    ? "Leave Circle"
                    : "Confirm " +
                      (type === "bills" ? "end Bill" : "close setup")
              }
              danger={intent !== "connect"}
              disabled={act.busy}
              onPress={submit}
            />
            <Action
              secondary
              label="Keep as it is"
              onPress={() => setIntent(null)}
            />
          </>
        ) : undefined
      }
    >
      <AuthGate returnTo={"/manage/" + type + "/" + id}>
        <ResourceState {...r} retry={r.reload} />
        {item && (
          <>
            <Title>{item.name}</Title>
            {!intent ? (
              <>
                {owned && type === "bills" && (
                  <Row
                    title="Propose new terms"
                    subtitle="Each person reviews their changes"
                    icon="bills"
                    onPress={() => go("/create/bill?id=" + id)}
                  />
                )}{" "}
                {owned && type !== "circles" && (
                  <Row
                    title="Change connection"
                    subtitle="Keep the same item and its history"
                    icon="circles"
                    onPress={() => setIntent("connect")}
                  />
                )}{" "}
                {type === "circles" ? (
                  !owned ? (
                    <Link danger onPress={() => setIntent("leave")}>
                      Leave this Circle
                    </Link>
                  ) : (
                    <Muted>
                      Circle hosting is separate from ownership of its Bills and
                      Cards.
                    </Muted>
                  )
                ) : (
                  <Link danger onPress={() => setIntent("end")}>
                    {type === "bills"
                      ? "End this Bill"
                      : "Close this Card setup"}
                  </Link>
                )}
              </>
            ) : intent === "connect" ? (
              <>
                <Title small>Connect to your people</Title>
                <Row
                  title="No Circle"
                  right={<Label>{circleId === null ? "✓" : ""}</Label>}
                  onPress={() => setCircle(null)}
                />
                {circles.data?.items.map((c) => (
                  <Row
                    key={c.id}
                    title={c.name}
                    right={<Label>{circleId === c.id ? "✓" : ""}</Label>}
                    onPress={() => setCircle(c.id)}
                  />
                ))}
                {type === "bills" && (
                  <>
                    <Title small>Funding Card</Title>
                    <Row
                      title="No funding Card"
                      right={<Label>{cardId === null ? "✓" : ""}</Label>}
                      onPress={() => setCard(null)}
                    />
                    {cards.data?.items.map((c) => (
                      <Row
                        key={c.id}
                        title={c.name}
                        right={<Label>{cardId === c.id ? "✓" : ""}</Label>}
                        onPress={() => setCard(c.id)}
                      />
                    ))}
                  </>
                )}
                <Muted>
                  Changing the connection does not enroll people, change their
                  terms or give them spending access.
                </Muted>
              </>
            ) : (
              <>
                <Title small>
                  {intent === "leave"
                    ? "Your separate agreements stay yours"
                    : type === "bills"
                      ? "End future arrangements"
                      : "Close the unissued setup"}
                </Title>
                <Muted>
                  {intent === "leave"
                    ? "You’ll leave this Circle. Existing Bill agreements remain accessible in Bills until separately canceled. Leaving does not cancel an external service or settle an obligation."
                    : type === "bills"
                      ? "Future agreement offers will be withdrawn and accepted terms canceled. History remains. This does not cancel the external subscription, refund money or close the funding Card."
                      : "This Card has not been issued. Close its setup after disconnecting or ending any active Bills. Its history remains available."}
                </Muted>
              </>
            )}
          </>
        )}
      </AuthGate>
    </Shell>
  );
}
