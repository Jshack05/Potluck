import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useNavigation } from "expo-router";
import {
  usePreventRemove,
  type NavigationProp,
} from "expo-router/react-navigation";
import {
  Action,
  AuthGate,
  ErrorText,
  Label,
  Link,
  Muted,
  ResourceState,
  Shell,
  go,
} from "@/design/system";
import {
  useAction,
  useClient,
  useCommand,
  useResource,
} from "@/services/client";
import { cardPeopleRoute, returnToRoute } from "@/services/route-return";
import { CardContext } from "./card-context";
import { CardActionRow, CardCircleChoice, CardHeading } from "./card-ui";
import type { Card, Circle, Collection } from "./types";

type Step = "menu" | "connection" | "close";
type ConnectionDraft = { circleId: string | null; version: number };

/** Card-only lifecycle presentation. Commands and permissions remain server-owned. */
export function CardManagement({ id }: { id: string }) {
  const { user } = useClient();
  const resource = useResource<Card>(user ? `/cards/${id}` : null);
  const [step, setStep] = useState<Step>("menu");
  const [draft, setDraft] = useState<ConnectionDraft | null>(null);
  const [closed, setClosed] = useState(false);
  const card = resource.data;
  const circle = useResource<Circle>(
    user && card?.circleId ? `/circles/${card.circleId}` : null,
  );
  const circles = useResource<Collection<Circle>>(
    user && step === "connection" ? "/circles" : null,
  );
  const act = useAction(),
    command = useCommand(),
    navigation = useNavigation<NavigationProp<{ cards: { closed: string } }>>();
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const owned = !!user && card?.hostId === user.id;
  const editable = owned && card?.status !== "closed" && !closed;
  const canClose = editable && card?.status === "setup_required";
  const cancel = () => {
    if (act.busy) return;
    setDraft(null);
    setStep("menu");
    act.setError("");
  };
  const back = () => {
    if (act.busy) return;
    if (step !== "menu") cancel();
    else returnToRoute(`/card/${id}/setup`);
  };
  usePreventRemove(true, ({ data }) => {
    if (act.busy) return;
    if (data.action.type === "GO_BACK" || data.action.type === "POP") back();
    else navigation.dispatch(data.action);
  });
  // Let the in-flight guard release before unwinding. Cards reload on focus.
  useEffect(() => {
    if (closed && !act.busy)
      navigation.reset({
        index: 0,
        routes: [{ name: "cards", params: { closed: id } }],
      });
  }, [closed, act.busy, id, navigation]);
  const enter = (next: Step) => {
    if (!card || !editable || act.busy) return;
    setDraft({ circleId: card.circleId, version: card.version });
    act.setError("");
    setStep(next);
  };
  const save = () =>
    act.run(async () => {
      if (!draft || !editable) return;
      await command(`/cards/${id}/connection`, {
        expectedVersion: draft.version,
        circleId: draft.circleId,
      });
      if (!alive.current) return;
      await resource.reload();
      if (alive.current) {
        setDraft(null);
        setStep("menu");
      }
    });
  const close = () =>
    act.run(async () => {
      if (!draft || !canClose) return;
      await command(`/cards/${id}/close`, {
        expectedVersion: draft.version,
        acknowledged: true,
      });
      if (alive.current) {
        setDraft(null);
        setStep("menu");
        setClosed(true);
      }
    });
  const title =
    step === "connection"
      ? "Change Circle"
      : step === "close"
        ? "Close card"
        : "Manage arrangement";
  return (
    <Shell
      title={title}
      subtitle={
        step === "connection"
          ? "Choose the Circle this card belongs to."
          : step === "close"
            ? "Review before closing."
            : "Manage your card and its people."
      }
      back
      active="Cards"
      onBack={back}
      returnTo={`/card/${id}/setup`}
      avoidKeyboard={false}
      footer={
        editable && step !== "menu" ? (
          <>
            <ErrorText text={act.error} />
            {step === "connection" ? (
              <>
                <View style={{ alignItems: "center" }}>
                  <Link onPress={cancel}>Cancel</Link>
                </View>
                <Action
                  label="Save connection"
                  disabled={
                    act.busy || !draft || circles.loading || !!circles.error
                  }
                  onPress={save}
                />
              </>
            ) : (
              <>
                <Action
                  label="Keep card"
                  disabled={act.busy}
                  onPress={cancel}
                />
                <Action
                  label="Close card"
                  danger
                  outline
                  disabled={act.busy || !canClose}
                  onPress={close}
                />
              </>
            )}
          </>
        ) : undefined
      }
    >
      <AuthGate returnTo={`/manage/cards/${id}`}>
        <ResourceState {...resource} retry={resource.reload} />
        {card && !closed && (
          <>
            <CardContext
              card={card}
              fullName={user?.name ?? ""}
              roleLabel={owned ? "HOST" : undefined}
            />
            {step === "menu" ? (
              <>
                <CardHeading>Connection</CardHeading>
                {card.circleId ? (
                  <>
                    <ResourceState {...circle} retry={circle.reload} />
                    {(circle.data || circle.error) && (
                      <CardActionRow
                        title={circle.data?.name ?? "Change Circle"}
                        subtitle={
                          circle.data
                            ? `${circle.data.memberCount} members`
                            : undefined
                        }
                        icon="circles"
                        onPress={
                          editable ? () => enter("connection") : undefined
                        }
                      />
                    )}
                  </>
                ) : (
                  <CardActionRow
                    title="Just for you"
                    subtitle="No Circle"
                    icon="person"
                    onPress={editable ? () => enter("connection") : undefined}
                  />
                )}
                <CardHeading>People</CardHeading>
                <CardActionRow
                  title="Trusted Spenders"
                  subtitle="Manage access and invitations"
                  icon="circles"
                  onPress={() => go(cardPeopleRoute(id, "manage"))}
                />
                <Muted>Circle membership does not grant spending access.</Muted>
                {canClose && (
                  <>
                    <CardHeading>Card management</CardHeading>
                    <CardActionRow
                      title="Close card"
                      subtitle="Saved history is kept."
                      icon="cards"
                      danger
                      onPress={() => enter("close")}
                    />
                  </>
                )}
              </>
            ) : step === "connection" && editable ? (
              <>
                <CardHeading>Choose a Circle</CardHeading>
                <ResourceState {...circles} retry={circles.reload} />
                {circles.data?.items.map((c) => (
                  <CardCircleChoice
                    key={c.id}
                    title={c.name}
                    subtitle={`${c.memberCount} members`}
                    selected={draft?.circleId === c.id}
                    variant="management"
                    disabled={act.busy}
                    onPress={() =>
                      setDraft((d) => d && { ...d, circleId: c.id })
                    }
                  />
                ))}
                <CardCircleChoice
                  title="Just for you"
                  subtitle="No Circle"
                  personal
                  variant="management"
                  selected={draft?.circleId === null}
                  disabled={act.busy}
                  onPress={() => setDraft((d) => d && { ...d, circleId: null })}
                />
              </>
            ) : step === "close" && canClose ? (
              <>
                <View
                  style={{
                    backgroundColor: "white",
                    borderRadius: 30,
                    padding: 20,
                    gap: 16,
                  }}
                >
                  <CardHeading>Close this card?</CardHeading>
                  <Muted>
                    This card will be removed from your active Cards.
                  </Muted>
                  <View style={{ gap: 4 }}>
                    <Label style={{ fontFamily: "Inter_600SemiBold" }}>
                      Saved history is kept.
                    </Label>
                    <Muted>Closing does not delete your records.</Muted>
                  </View>
                  <View style={{ gap: 4, marginTop: 28 }}>
                    <Label style={{ fontFamily: "Inter_600SemiBold" }}>
                      Your Circle stays unchanged.
                    </Label>
                    <Muted>Your bank account stays connected.</Muted>
                  </View>
                </View>
                <Muted>Disconnect or end active Bills before closing.</Muted>
              </>
            ) : null}
          </>
        )}
      </AuthGate>
    </Shell>
  );
}
