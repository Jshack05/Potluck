import { useEffect, useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { proposalShares } from "@potluck/domain/money";
import { View, Pressable, Switch } from "react-native";
import { router, useLocalSearchParams, type Href } from "expo-router";
import {
  Shell,
  AuthGate,
  Title,
  Muted,
  Label,
  Field,
  Row,
  Action,
  ErrorText,
  ResourceState,
  Section,
  theme,
  money,
  dateLabel,
  styles,
  Link,
} from "@/design/system";
import {
  useAction,
  useClient,
  useCommand,
  useResource,
} from "@/services/client";
import { Calendar } from "@/features/potluck/calendar";
import { moneyInput } from "@/features/potluck/calendar-model";
import type {
  Bill,
  Card,
  Circle,
  Collection,
  Person,
} from "@/features/potluck/types";
export default function CreateBill() {
  const params = useLocalSearchParams<{
      circleId?: string;
      cardId?: string;
      id?: string;
    }>(),
    { user } = useClient(),
    existing = useResource<Bill>(
      user && params.id ? "/bills/" + params.id : null,
    );
  if (params.id && !existing.data)
    return (
      <Shell title="Edit Bill" back>
        <AuthGate returnTo={"/create/bill?id=" + params.id}>
          <ResourceState {...existing} retry={existing.reload} />
        </AuthGate>
      </Shell>
    );
  return (
    <BillEditor
      key={(user?.id ?? "guest") + ":" + (params.id ?? "new")}
      original={existing.data}
    />
  );
}
function BillEditor({ original }: { original: Bill | null }) {
  const { user } = useClient(),
    params = useLocalSearchParams<{ circleId?: string; cardId?: string }>();
  const draftKey = user
    ? "potluck.draft.bill." +
      user.id +
      "." +
      (original
        ? original.id + "." + original.version
        : "new." +
          (params.circleId ?? "none") +
          "." +
          (params.cardId ?? "none"))
    : null;
  const [loaded, setLoaded] = useState<{
      key: string | null;
      draft: Record<string, any> | null;
    } | null>(null),
    [error, setError] = useState(""),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    if (!draftKey) return;
    void AsyncStorage.getItem(draftKey)
      .then((value) => {
        if (active)
          setLoaded({ key: draftKey, draft: value ? JSON.parse(value) : null });
      })
      .catch(() => {
        if (active)
          setError(
            "Your draft could not be loaded. Try again before continuing.",
          );
      });
    return () => {
      active = false;
    };
  }, [draftKey, attempt]);
  if (!user || loaded?.key !== draftKey)
    return (
      <Shell title="Create Bill" back active="Bills">
        <AuthGate returnTo="/create/bill">
          <ResourceState
            loading={!error}
            error={error}
            retry={() => setAttempt((n) => n + 1)}
          />
        </AuthGate>
      </Shell>
    );
  return (
    <BillForm
      key={draftKey}
      original={original}
      draftKey={draftKey!}
      draft={loaded.draft}
    />
  );
}
function BillForm({
  original,
  draftKey,
  draft,
}: {
  original: Bill | null;
  draftKey: string;
  draft: Record<string, any> | null;
}) {
  const params = useLocalSearchParams<{ circleId?: string; cardId?: string }>(),
    { user } = useClient(),
    command = useCommand(),
    action = useAction();
  const [step, setStep] = useState<number>(draft?.step ?? 0),
    [name, setName] = useState<string>(draft?.name ?? original?.name ?? ""),
    [amount, setAmount] = useState<string>(
      draft?.amount ?? (original ? String(original.amountMinor / 100) : ""),
    ),
    [maximum, setMaximum] = useState<string>(
      draft?.maximum ??
        (original?.maximumMinor ? String(original.maximumMinor / 100) : ""),
    ),
    [kind, setKind] = useState<"fixed" | "flexible">(
      draft?.kind ?? original?.kind ?? "fixed",
    ),
    [frequency, setFrequency] = useState<"once" | "weekly" | "monthly">(
      draft?.frequency ?? original?.frequency ?? "monthly",
    ),
    [date, setDate] = useState<string>(
      draft?.date ??
        original?.firstDueDate.slice(0, 10) ??
        new Date().toISOString().slice(0, 10),
    ),
    [circleId, setCircleId] = useState<string | null>(
      draft?.circleId ?? original?.circleId ?? params.circleId ?? null,
    ),
    [cardId, setCardId] = useState<string | null>(
      draft?.cardId ?? original?.cardId ?? params.cardId ?? null,
    ),
    [selectedOverride, setSelected] = useState<string[] | null>(
      draft?.selectedOverride ??
        (original
          ? original.agreements
              .filter((a) => a.termsVersion === original.version)
              .map((a) => a.participantId)
          : null),
    ),
    [equal, setEqual] = useState<boolean>(draft?.equal ?? !original),
    [custom, setCustom] = useState<Record<string, string>>(
      draft?.custom ??
        Object.fromEntries(
          (
            original?.agreements.filter(
              (a) => a.termsVersion === original.version,
            ) ?? []
          ).map((a) => [a.participantId, String(a.amountMinor / 100)]),
        ),
    ),
    [newCardName, setNewCardName] = useState<string>(draft?.newCardName ?? ""),
    [createCard, setCreateCard] = useState<boolean>(draft?.createCard ?? false);
  const [workflowId] = useState<string>(
      () => draft?.workflowId ?? Crypto.randomUUID(),
    ),
    completed = useRef(false),
    [draftError, setDraftError] = useState("");
  const circles = useResource<Collection<Circle>>(user ? "/circles" : null),
    cards = useResource<Collection<Card>>(user ? "/cards" : null),
    circle = useResource<Circle>(
      user && circleId ? "/circles/" + circleId : null,
    );
  const [unit, setUnit] = useState<"dollars" | "percent">(
      draft?.unit ?? "dollars",
    ),
    [caps, setCaps] = useState<Record<string, string>>(
      draft?.caps ??
        Object.fromEntries(
          (
            original?.agreements.filter(
              (a) => a.termsVersion === original.version,
            ) ?? []
          ).map((a) => [a.participantId, String(a.maximumMinor / 100)]),
        ),
    );
  const snapshot = {
    step,
    name,
    amount,
    maximum,
    kind,
    frequency,
    date,
    circleId,
    cardId,
    selectedOverride,
    equal,
    custom,
    newCardName,
    createCard,
    unit,
    caps,
    workflowId,
  };
  const draftText = JSON.stringify(snapshot);
  useEffect(() => {
    if (completed.current) return;
    void AsyncStorage.setItem(draftKey, draftText).catch(() =>
      setDraftError("Your draft could not be saved on this device."),
    );
  }, [draftKey, draftText]);
  const selected = selectedOverride ?? (user ? [user.id] : []);
  const people: Person[] = Array.from(
    new Map(
      [
        ...(original?.agreements.map((a) => ({
          id: a.participantId,
          name: a.name,
        })) ?? []),
        ...(circle.data?.people ?? []),
        ...(user ? [{ id: user.id, name: user.name }] : []),
      ].map((p) => [p.id, p]),
    ).values(),
  );
  function percentages() {
    return Object.fromEntries(
      selected.map((id) => [id, moneyInput(custom[id] ?? "")]),
    );
  }
  function proposal() {
    const amountMinor = moneyInput(amount);
    if (amountMinor <= 0) throw new Error("Enter a positive Bill amount.");
    const input = {
      amountMinor,
      kind,
      maximumMinor: kind === "flexible" ? moneyInput(maximum) : null,
      participants: selected,
      ...(equal
        ? {}
        : unit === "percent"
          ? { percentages: percentages() }
          : {
              allocation: Object.fromEntries(
                selected.map((id) => [id, moneyInput(custom[id] ?? "")]),
              ),
            }),
    };
    const initial = proposalShares(input);
    return proposalShares({
      ...input,
      ...(kind === "flexible"
        ? {
            personalCaps: Object.fromEntries(
              selected.map((id) => [
                id,
                caps[id] ? moneyInput(caps[id]) : initial.caps[id],
              ]),
            ),
          }
        : {}),
    });
  }
  function allocation() {
    return proposal().allocation;
  }
  function next() {
    action.setError("");
    try {
      if (step === 0) {
        if (!name.trim()) throw new Error("Give this Bill a name.");
        if (moneyInput(amount) <= 0) throw new Error("Enter a Bill amount.");
        if (kind === "flexible" && moneyInput(maximum) < moneyInput(amount))
          throw new Error("The maximum must cover the estimate.");
      }
      if (step === 1) allocation();
      if (step === 2 && createCard && !newCardName.trim())
        throw new Error("Name the new Card.");
      setStep(step + 1);
    } catch (e) {
      action.setError((e as Error).message);
    }
  }
  const submit = () =>
    action.run(async () => {
      proposal();
      await AsyncStorage.setItem(draftKey, draftText);
      let fundingCard = cardId;
      if (createCard) {
        const card = await command<Card>(
          "/cards",
          {
            name: newCardName,
            design: "aurora",
            circleId,
          },
          workflowId,
        );
        fundingCard = card.id;
        setCardId(card.id);
        setCreateCard(false);
      }
      const bill = await command<Bill>(
        original ? "/bills/" + original.id + "/revise" : "/bills",
        {
          ...(original ? { expectedVersion: original.version } : {}),
          name,
          kind,
          amountMinor: moneyInput(amount),
          maximumMinor: kind === "flexible" ? moneyInput(maximum) : null,
          frequency,
          firstDueDate: date,
          circleId,
          cardId: fundingCard,
          participants: selected,
          ...(!equal && unit === "percent"
            ? { percentages: percentages() }
            : { allocation: allocation() }),
          ...(kind === "flexible" ? { personalCaps: proposal().caps } : {}),
        },
        workflowId,
      );
      completed.current = true;
      await AsyncStorage.removeItem(draftKey);
      router.replace(("/bill/" + bill.id) as Href);
    });
  let review: Record<string, number> = {};
  try {
    if (step === 3) review = allocation();
  } catch {}
  return (
    <Shell
      title={original ? "Update Bill terms" : "Create Bill"}
      back
      active="Bills"
      footer={
        user && (
          <>
            <ErrorText text={action.error || draftError} />
            {step > 0 && (
              <Action
                label="Previous step"
                secondary
                disabled={action.busy}
                onPress={() => {
                  action.setError("");
                  setStep(step - 1);
                }}
              />
            )}
            <Action
              label={
                action.busy
                  ? "Saving…"
                  : step === 3
                    ? "Send individual proposals"
                    : "Continue"
              }
              disabled={action.busy}
              onPress={step === 3 ? submit : next}
            />
          </>
        )
      }
    >
      <AuthGate
        returnTo={
          "/create/bill" +
          (params.circleId ? "?circleId=" + params.circleId : "")
        }
      >
        <View style={styles.row}>
          {["Bill", "People", "Card", "Review"].map((label, index) => (
            <View key={label} style={{ flex: 1, gap: 7 }}>
              <View
                style={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: index <= step ? theme.teal : theme.line,
                }}
              />
              <Label
                style={{
                  fontSize: 12,
                  color: index === step ? theme.teal : theme.muted,
                }}
              >
                {label}
              </Label>
            </View>
          ))}
        </View>
        {step === 0 && (
          <>
            <Title>What are you sharing?</Title>
            <Field
              label="Bill name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Internet"
              maxLength={80}
            />
            <View style={styles.row}>
              {(["fixed", "flexible"] as const).map((value) => (
                <Pressable
                  key={value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: kind === value }}
                  aria-checked={kind === value}
                  onPress={() => setKind(value)}
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRadius: 22,
                    backgroundColor: kind === value ? theme.mint : "white",
                  }}
                >
                  <Label style={{ fontFamily: "Inter_600SemiBold" }}>
                    {value === "fixed" ? "Fixed amount" : "Flexible amount"}
                  </Label>
                </Pressable>
              ))}
            </View>
            <Field
              label={
                kind === "fixed" ? "Bill total ($)" : "Estimated total ($)"
              }
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
            />
            {kind === "flexible" && (
              <Field
                label="Bill maximum ($)"
                keyboardType="decimal-pad"
                value={maximum}
                onChangeText={setMaximum}
                placeholder="0.00"
              />
            )}
            <Section title="How often?" />
            <View style={[styles.row, { flexWrap: "wrap" }]}>
              {(["once", "weekly", "monthly"] as const).map((value) => (
                <Pressable
                  key={value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: frequency === value }}
                  aria-checked={frequency === value}
                  onPress={() => setFrequency(value)}
                  style={{
                    padding: 12,
                    borderRadius: 24,
                    backgroundColor: value === frequency ? theme.mint : "white",
                    minHeight: 48,
                  }}
                >
                  <Label style={{ textTransform: "capitalize" }}>{value}</Label>
                </Pressable>
              ))}
            </View>
            <Section title="First due date" />
            <Calendar value={date} onChange={setDate} />
            <Section title="Connect a Circle" />
            <Row
              title="Continue without a Circle"
              right={<Label>{!circleId ? "✓" : ""}</Label>}
              onPress={() => {
                setCircleId(null);
                setSelected(user ? [user.id] : []);
              }}
            />
            {circles.data?.items.map((c) => (
              <Row
                key={c.id}
                title={c.name}
                right={<Label>{circleId === c.id ? "✓" : ""}</Label>}
                onPress={() => {
                  setCircleId(c.id);
                  setSelected(user ? [user.id] : []);
                }}
              />
            ))}
          </>
        )}
        {step === 1 && (
          <>
            <Title>Who’s sharing this Bill?</Title>
            <Muted>
              Everyone receives their own proposal. Nothing is collected when
              you send it.
            </Muted>
            <ResourceState
              loading={circle.loading}
              error={circle.error}
              retry={circle.reload}
            />
            {people.map((person) => (
              <Row
                key={person.id}
                title={person.name + (person.id === user?.id ? " (you)" : "")}
                right={
                  <Label style={{ color: theme.teal }}>
                    {selected.includes(person.id) ? "✓" : "+"}
                  </Label>
                }
                onPress={() =>
                  setSelected(
                    selected.includes(person.id)
                      ? selected.filter((id) => id !== person.id)
                      : [...selected, person.id],
                  )
                }
              />
            ))}
            <View style={[styles.row, { justifyContent: "space-between" }]}>
              <Title small>Split equally</Title>
              <Switch
                accessibilityLabel="Split equally"
                value={equal}
                onValueChange={setEqual}
                trackColor={{ true: theme.teal }}
              />
            </View>
            {!equal && (
              <View style={styles.row}>
                {(["dollars", "percent"] as const).map((x) => (
                  <Action
                    key={x}
                    secondary={unit !== x}
                    label={x === "dollars" ? "Dollars" : "Percentages"}
                    onPress={() => {
                      setUnit(x);
                      setCustom({});
                    }}
                  />
                ))}
              </View>
            )}
            {!equal &&
              people
                .filter((p) => selected.includes(p.id))
                .map((person) => (
                  <Field
                    key={person.id}
                    label={
                      person.name +
                      (unit === "dollars"
                        ? "’s proposed share ($)"
                        : "’s percentage (%)")
                    }
                    keyboardType="decimal-pad"
                    value={custom[person.id] ?? ""}
                    onChangeText={(value) =>
                      setCustom({ ...custom, [person.id]: value })
                    }
                  />
                ))}
            {kind === "flexible" && (
              <>
                <Title small>Personal maximums</Title>
                <Muted>
                  Each person will review their own cap. Leave blank to use
                  their proportional share of the Bill maximum.
                </Muted>
                {people
                  .filter((p) => selected.includes(p.id))
                  .map((p) => (
                    <Field
                      key={p.id}
                      label={p.name + "’s maximum ($)"}
                      value={caps[p.id] ?? ""}
                      keyboardType="decimal-pad"
                      onChangeText={(value) =>
                        setCaps({ ...caps, [p.id]: value })
                      }
                    />
                  ))}
              </>
            )}
            <Muted>
              {circleId
                ? "Only accepted Circle members are shown."
                : "Continue with your own Bill, or connect a Circle to propose shares to its members."}
            </Muted>
          </>
        )}
        {step === 2 && (
          <>
            <Title>Choose a funding Card</Title>
            <Muted>
              Connecting a Card does not give contributors spending access.
            </Muted>
            <ResourceState
              loading={cards.loading}
              error={cards.error}
              retry={cards.reload}
            />
            {cards.data?.items.map((card) => (
              <Row
                key={card.id}
                title={card.name}
                subtitle="Setup required"
                icon="cards"
                right={
                  <Label>{card.id === cardId && !createCard ? "✓" : ""}</Label>
                }
                onPress={() => {
                  setCardId(card.id);
                  setCreateCard(false);
                }}
              />
            ))}
            <Row
              title="Create a new Card setup"
              icon="cards"
              right={<Label>{createCard ? "✓" : "+"}</Label>}
              onPress={() => {
                setCreateCard(true);
                setNewCardName(name + " card");
              }}
            />
            {createCard && (
              <Field
                label="New Card name"
                value={newCardName}
                onChangeText={setNewCardName}
                maxLength={80}
              />
            )}
            <Link
              onPress={() => {
                setCreateCard(false);
                setCardId(null);
              }}
            >
              Set up the funding Card later{!cardId && !createCard ? " ✓" : ""}
            </Link>
          </>
        )}
        {step === 3 && (
          <>
            <Title>Review the proposal</Title>
            <Label
              style={{
                fontSize: 40,
                lineHeight: 48,
                fontFamily: "Inter_700Bold",
                color: theme.teal,
              }}
            >
              {money(moneyInput(amount))}
            </Label>
            <Muted>
              {name} · {frequency} · starts {dateLabel(date)}
              {kind === "flexible" ? " · estimate" : ""}
            </Muted>
            {kind === "flexible" && (
              <Muted>Bill maximum {money(moneyInput(maximum))}</Muted>
            )}
            <Section title="Individual shares" />
            {people
              .filter((p) => selected.includes(p.id))
              .map((person) => (
                <View
                  key={person.id}
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.line,
                    gap: 6,
                  }}
                >
                  <View
                    style={[styles.row, { justifyContent: "space-between" }]}
                  >
                    <Label style={{ flex: 1 }}>{person.name}</Label>
                    <Label>{money(review[person.id] ?? 0)}</Label>
                  </View>
                  <Muted>
                    {kind === "flexible"
                      ? "Maximum " + money(proposal().caps[person.id]) + " · "
                      : ""}
                    Acceptance required
                  </Muted>
                </View>
              ))}
            <Section title="Funding Card" />
            <Muted>
              {createCard
                ? newCardName
                : (cards.data?.items.find((c) => c.id === cardId)?.name ??
                  "Set up later")}
            </Muted>
            <Muted>
              Sending this proposal does not debit anyone’s bank account. Each
              person must separately agree to their terms.
            </Muted>
          </>
        )}
      </AuthGate>
    </Shell>
  );
}
