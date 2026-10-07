import { useEffect, useState, useRef } from "react";
import { Image } from "expo-image";
import {
  billSteps,
  restoredBillStep,
  restoredBillConnection,
  savesPlanningBill,
  adjacentBillStep,
  nextWeekday,
} from "@/features/potluck/bill-flow-model";
import {
  BillIcon,
  BillInput,
  BillOption,
  BillPanel,
  BillInfo,
  BillPerson,
  billIcons,
  billColors,
  billStyles,
  type BillIconName,
  type BillColorName,
} from "@/features/potluck/bill-ui";
import { CardPreview } from "@/features/potluck/card-preview";
import {
  submitCreation,
  type CreationDraft,
} from "@/services/creation-draft-model";
import { creationPath } from "@/services/navigation";
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
  theme,
  money,
  dateLabel,
  styles,
  Link,
  Avatar,
  go,
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
        <AuthGate returnTo={creationPath("/create/bill", params)}>
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
  const [storedStep, setStep] = useState<number>(
      restoredBillStep(draft?.step, draft?.flowVersion),
    ),
    [icon, setIcon] = useState<BillIconName>(
      draft?.icon ?? original?.icon ?? "bill",
    ),
    [color, setColor] = useState<BillColorName>(
      draft?.color ?? original?.color ?? "teal",
    ),
    [search, setSearch] = useState(""),
    [searched, setSearched] = useState(""),
    [directPeople, setDirectPeople] = useState<Person[]>(
      draft?.directPeople ?? [],
    ),
    [reason, setReason] = useState<string>(draft?.reason ?? ""),
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
      restoredBillConnection(
        draft,
        "circleId",
        original?.circleId ?? params.circleId ?? null,
      ),
    ),
    [cardId, setCardId] = useState<string | null>(
      restoredBillConnection(
        draft,
        "cardId",
        original?.cardId ?? params.cardId ?? null,
      ),
    ),
    [selectedOverride, setSelected] = useState<string[] | null>(
      draft?.selectedOverride ??
        (original && original.agreements.length > 0
          ? original.agreements
              .filter((a) => a.termsVersion === original.version)
              .map((a) => a.participantId)
          : null),
    ),
    [equal, setEqual] = useState<boolean>(
      draft?.equal ??
        (!original ||
          original.agreements
            .filter((a) => a.termsVersion === original.version)
            .every((a) => a.terms.calculation?.basis === "equal")),
    ),
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
  const [submission, setSubmission] = useState<
    CreationDraft<Record<string, never>, Bill>
  >(
    () =>
      draft?.submission ?? {
        workflowId,
        fields: {},
        pending: null,
        result: null,
      },
  );
  const submissionRef = useRef(submission),
    draftQueue = useRef(Promise.resolve());
  const resuming = Boolean(submission.pending || submission.result);
  const circles = useResource<Collection<Circle>>(user ? "/circles" : null),
    cards = useResource<Collection<Card>>(user ? "/cards" : null),
    foundPeople = useResource<Collection<Person>>(
      user && searched ? "/people?q=" + encodeURIComponent(searched) : null,
    ),
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
  const selected = selectedOverride ?? (user ? [user.id] : []);
  const planningOnly = savesPlanningBill(
    selected,
    user?.id ?? "",
    original?.agreements.length ?? 0,
  );
  // Old personal drafts may still point at the allocation page.
  const step = planningOnly && storedStep === 3 ? 4 : storedStep;
  const snapshot = {
    flowVersion: 2,
    icon,
    color,
    directPeople,
    reason,
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
    submission,
  };
  const draftText = JSON.stringify(snapshot);
  const latestDraft = useRef(snapshot);
  useEffect(() => {
    latestDraft.current = JSON.parse(draftText);
  }, [draftText]);
  function persistDraft() {
    const write = draftQueue.current.then(() =>
      AsyncStorage.setItem(
        draftKey,
        JSON.stringify({
          ...latestDraft.current,
          submission: submissionRef.current,
        }),
      ),
    );
    draftQueue.current = write.catch(() => {});
    return write;
  }
  useEffect(() => {
    if (completed.current) return;
    const write = draftQueue.current.then(() =>
      AsyncStorage.setItem(
        draftKey,
        JSON.stringify({
          ...latestDraft.current,
          submission: submissionRef.current,
        }),
      ),
    );
    draftQueue.current = write.catch(() => {});
    void write.catch(() =>
      setDraftError("Your draft could not be saved on this device."),
    );
  }, [draftKey, draftText]);
  const people: Person[] = Array.from(
    new Map(
      [
        ...(original?.agreements.map((a) => ({
          id: a.participantId,
          name: a.name,
        })) ?? []),
        ...(circle.data?.people ?? []),
        ...directPeople,
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
      ...(equal || planningOnly
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
      ...(kind === "flexible" && !planningOnly
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
  const selectedPeople = people.filter((person) =>
    selected.includes(person.id),
  );
  const selectedCard = cards.data?.items.find((card) => card.id === cardId);
  function next() {
    action.setError("");
    try {
      if (step === 0 && !name.trim()) throw new Error("Give this bill a name.");
      if (step === 1) {
        if (moneyInput(amount) <= 0)
          throw new Error("Enter a positive bill amount.");
        if (kind === "flexible" && moneyInput(maximum) < moneyInput(amount))
          throw new Error("The maximum must cover the estimate.");
        if (!date) throw new Error("Choose the first due date.");
      }
      if (step === 2 && !selected.length)
        throw new Error("Choose at least one person.");
      if (step === 3) allocation();
      if (step === 4 && createCard && !newCardName.trim())
        throw new Error("Name the new Card.");
      setStep(adjacentBillStep(step, 1, planningOnly));
    } catch (error) {
      action.setError((error as Error).message);
    }
  }
  const submit = () =>
    action.run(async () => {
      proposal();
      const body = {
        ...(original
          ? {
              expectedVersion: original.version,
              expectedConnectionVersion: original.connectionVersion,
            }
          : {}),
        name,
        icon,
        color,
        kind,
        amountMinor: moneyInput(amount),
        maximumMinor: kind === "flexible" ? moneyInput(maximum) : null,
        frequency,
        firstDueDate: date,
        circleId,
        cardId,
        participants: selected,
        planningOnly,
        ...(original && reason.trim()
          ? { reasonForChange: reason.trim() }
          : {}),
        ...(equal || planningOnly
          ? {}
          : unit === "percent"
            ? { percentages: percentages() }
            : { allocation: allocation() }),
        ...(kind === "flexible" ? { personalCaps: proposal().caps } : {}),
      };
      const bill = await submitCreation(
        submissionRef.current,
        {
          bill: body,
          card: createCard
            ? { name: newCardName, design: "aurora", circleId }
            : null,
        },
        async (request, identity) => {
          const billBody = request.bill as Record<string, unknown>;
          let fundingCard = billBody.cardId;
          if (request.card) {
            const card = await command<Card>(
              "/cards",
              request.card,
              identity + ":card",
            );
            fundingCard = card.id;
            setCardId(card.id);
            setCreateCard(false);
          }
          return command<Bill>(
            original ? "/bills/" + original.id + "/revise" : "/bills",
            { ...billBody, cardId: fundingCard },
            identity + ":bill",
          );
        },
        async (state) => {
          submissionRef.current = state;
          setSubmission(state);
          await persistDraft();
        },
      );
      completed.current = true;
      await draftQueue.current;
      await AsyncStorage.removeItem(draftKey);
      router.replace(
        (planningOnly ? "/bills?scope=all" : "/bill/" + bill.id) as Href,
      );
    });
  let review: Record<string, number> = {},
    calculationError = "";
  try {
    if (step >= 3) review = allocation();
  } catch (error) {
    calculationError = (error as Error).message;
  }
  const back = () => {
    if (action.busy || resuming) return;
    action.setError("");
    if (step > 0) setStep(adjacentBillStep(step, -1, planningOnly));
    else if (router.canGoBack()) router.back();
    else router.replace("/bills");
  };
  const chooseCircle = (id: string | null) => {
    if (id !== circleId) {
      setCircleId(id);
      setSelected(user ? [user.id] : []);
      setDirectPeople([]);
    }
  };
  const togglePerson = (id: string) =>
    setSelected(
      selected.includes(id)
        ? selected.filter((value) => value !== id)
        : [...selected, id],
    );
  return (
    <Shell
      title={billSteps[step]}
      back
      onBack={back}
      hideNavigation
      active="Bills"
      returnTo="/bills"
      footer={
        user && (
          <>
            <ErrorText text={action.error || draftError} />
            {resuming && (
              <Muted>
                Finish saving this request before changing its details.
              </Muted>
            )}
            <Action
              label={
                action.busy
                  ? "Saving…"
                  : resuming
                    ? "Resume saving bill"
                    : step === 5
                      ? planningOnly
                        ? "Save bill"
                        : original
                          ? "Send updated proposals"
                          : "Create bill and send proposals"
                      : step === 1
                        ? "Confirm amount and schedule"
                        : step === 3
                          ? "Confirm contributions"
                          : "Continue"
              }
              disabled={action.busy}
              onPress={step === 5 || resuming ? submit : next}
            />
          </>
        )
      }
    >
      <AuthGate returnTo={creationPath("/create/bill", params)}>
        <View
          pointerEvents={action.busy || resuming ? "none" : "auto"}
          style={{ gap: 16 }}
        >
          {step === 0 && (
            <>
              <Muted>
                Review the bill name and choose how its amount works.
              </Muted>
              <Label style={billStyles.section}>
                What kind of bill is this?
              </Label>
              <View style={styles.row}>
                <BillOption
                  title="Fixed bill"
                  detail="Same amount every cycle."
                  selected={kind === "fixed"}
                  onPress={() => setKind("fixed")}
                />
                <BillOption
                  title="Flexible bill"
                  detail="Amount can change each cycle."
                  selected={kind === "flexible"}
                  onPress={() => setKind("flexible")}
                />
              </View>
              <View style={{ marginTop: 30, gap: 12 }}>
                <Label style={billStyles.section}>Bill name</Label>
                <BillInput
                  accessibilityLabel="Bill name"
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Internet bill"
                  maxLength={80}
                  style={{ borderRadius: 28 }}
                />
              </View>
              <Label style={billStyles.section}>Choose an icon</Label>
              <View style={{ gap: 16 }}>
                {Array.from({ length: 3 }, (_, row) => (
                  <View
                    key={row}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    {(Object.keys(billIcons) as BillIconName[])
                      .slice(row * 5, row * 5 + 5)
                      .map((key) => (
                        <Pressable
                          key={key}
                          accessibilityRole="radio"
                          accessibilityLabel={key + " icon"}
                          accessibilityState={{ checked: icon === key }}
                          aria-checked={icon === key}
                          onPress={() => setIcon(key)}
                          style={{
                            borderRadius: 19,
                            borderWidth: 2,
                            borderColor:
                              icon === key ? theme.teal : "transparent",
                          }}
                        >
                          <BillIcon name={key} />
                        </Pressable>
                      ))}
                  </View>
                ))}
              </View>
              <Label style={billStyles.section}>Choose a color</Label>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 4,
                }}
              >
                {(Object.keys(billColors) as BillColorName[]).map((key) => (
                  <Pressable
                    key={key}
                    accessibilityRole="radio"
                    accessibilityLabel={key + " color"}
                    accessibilityState={{ checked: color === key }}
                    aria-checked={color === key}
                    onPress={() => setColor(key)}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      borderWidth: 2,
                      borderColor: "transparent",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {color === key && (
                      <Image
                        source={require("../../../assets/potluck/bill/color-ring.svg")}
                        style={{ position: "absolute", width: 52, height: 52 }}
                      />
                    )}
                    <Image
                      source={billColors[key].asset}
                      style={{ width: 44, height: 44 }}
                      contentFit="contain"
                    />
                  </Pressable>
                ))}
              </View>
            </>
          )}
          {step === 1 && (
            <>
              <Muted>Choose the amount and when this bill is due.</Muted>
              <Label style={billStyles.section}>
                {kind === "fixed"
                  ? frequency === "weekly"
                    ? "Weekly amount"
                    : frequency === "once"
                      ? "Bill amount"
                      : "Monthly amount"
                  : "Estimated amount"}
              </Label>
              <BillInput
                accessibilityLabel="Bill amount in dollars"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
                placeholder="$0.00"
                style={{ borderRadius: 28 }}
              />
              {kind === "flexible" && (
                <>
                  <Label style={billStyles.section}>Bill maximum</Label>
                  <BillInput
                    accessibilityLabel="Bill maximum in dollars"
                    keyboardType="decimal-pad"
                    value={maximum}
                    onChangeText={setMaximum}
                    placeholder="$0.00"
                    style={{ borderRadius: 28 }}
                  />
                  <Muted>
                    Your estimate helps with planning. Each person reviews their
                    own maximum before accepting.
                  </Muted>
                </>
              )}
              <Label style={billStyles.section}>How often?</Label>
              <View style={styles.row}>
                <BillOption
                  title="Monthly"
                  detail="Due once a month."
                  selected={frequency === "monthly"}
                  onPress={() => setFrequency("monthly")}
                />
                <BillOption
                  title="Weekly"
                  detail="Due once a week."
                  selected={frequency === "weekly"}
                  onPress={() => setFrequency("weekly")}
                />
              </View>
              <Link
                onPress={() =>
                  setFrequency(frequency === "once" ? "monthly" : "once")
                }
              >
                {frequency === "once"
                  ? "✓ One-time bill"
                  : "Make this a one-time bill"}
              </Link>
              <Label style={billStyles.section}>
                {frequency === "weekly"
                  ? "Select a day of the week"
                  : frequency === "once"
                    ? "Select a due date"
                    : "Select a day of the month"}
              </Label>
              {frequency === "weekly" && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    backgroundColor: "white",
                    borderRadius: 28,
                    padding: 8,
                  }}
                >
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                    <Pressable
                      key={index}
                      accessibilityRole="radio"
                      accessibilityLabel={
                        [
                          "Sunday",
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                        ][index]
                      }
                      accessibilityState={{
                        checked:
                          new Date(date + "T12:00:00").getDay() === index,
                      }}
                      aria-checked={
                        new Date(date + "T12:00:00").getDay() === index
                      }
                      onPress={() => setDate(nextWeekday(index, date))}
                      style={{
                        width: "13%",
                        minHeight: 44,
                        borderRadius: 22,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor:
                          new Date(date + "T12:00:00").getDay() === index
                            ? theme.teal
                            : "white",
                      }}
                    >
                      <Label
                        style={{
                          color:
                            new Date(date + "T12:00:00").getDay() === index
                              ? "white"
                              : theme.ink,
                        }}
                      >
                        {day}
                      </Label>
                    </Pressable>
                  ))}
                </View>
              )}
              <Calendar value={date} onChange={setDate} />
              <Muted>
                First due: {dateLabel(date)}
                {frequency === "monthly" && Number(date.slice(8)) > 28
                  ? ". Shorter months use their last day."
                  : ""}
              </Muted>
            </>
          )}
          {step === 2 && (
            <>
              <Muted>
                Choose a Circle to connect this bill to, or invite people
                directly.
              </Muted>
              <Label style={billStyles.section}>Choose a Circle</Label>
              <ResourceState
                loading={circles.loading}
                data={circles.data}
                error={circles.error}
                retry={circles.reload}
              />
              {circles.data?.items.map((item) => (
                <BillPerson
                  key={item.id}
                  name={item.name}
                  subtitle={`${item.people?.length ?? 0} members`}
                  selected={circleId === item.id}
                  onPress={() => chooseCircle(item.id)}
                />
              ))}
              <Row
                title="Continue without a Circle"
                right={<Label>{!circleId ? "✓" : "○"}</Label>}
                onPress={() => chooseCircle(null)}
              />
              <Row
                title="Create a new Circle"
                icon="plus"
                onPress={() => go("/create/circle")}
              />
              <Label style={billStyles.section}>People on this bill</Label>
              <ResourceState
                loading={circle.loading}
                data={circle.data}
                error={circle.error}
                retry={circle.reload}
              />
              {people.map((person) => (
                <BillPerson
                  key={person.id}
                  name={person.name + (person.id === user?.id ? " (you)" : "")}
                  selected={selected.includes(person.id)}
                  onPress={() => togglePerson(person.id)}
                />
              ))}
              {!circleId && (
                <>
                  <Field
                    label="Find someone on Potluck"
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Name or exact email"
                    autoCapitalize="none"
                  />
                  <Action
                    secondary
                    label="Find people"
                    disabled={search.trim().length < 2}
                    onPress={() => setSearched(search.trim())}
                  />
                  {searched && (
                    <>
                      <ResourceState
                        loading={foundPeople.loading}
                        data={foundPeople.data}
                        error={foundPeople.error}
                        retry={foundPeople.reload}
                      />
                      {foundPeople.data?.items
                        .filter(
                          (person) =>
                            !people.some((value) => value.id === person.id),
                        )
                        .map((person) => (
                          <BillPerson
                            key={person.id}
                            name={person.name}
                            selected={false}
                            onPress={() => {
                              setDirectPeople([...directPeople, person]);
                              setSelected([...selected, person.id]);
                            }}
                          />
                        ))}
                      {foundPeople.data?.items.length === 0 && (
                        <Muted>
                          No matching people. Try their exact email.
                        </Muted>
                      )}
                    </>
                  )}
                </>
              )}
              <BillInfo>
                Connecting a Circle does not enroll its members. Choose who
                should receive their own contribution terms.
              </BillInfo>
            </>
          )}
          {step === 3 && (
            <>
              <Muted>
                {planningOnly
                  ? "Save your bill for planning. No contribution agreement is created."
                  : "Set each person’s proposed share. They’ll review it before anything starts."}
              </Muted>
              <BillPanel>
                <View style={styles.row}>
                  <BillIcon name={icon} />
                  <View style={{ flex: 1 }}>
                    <Title small>{name}</Title>
                    <Muted>
                      {money(moneyInput(amount))} · {frequency}
                    </Muted>
                  </View>
                </View>
              </BillPanel>
              <View
                style={[
                  styles.row,
                  { justifyContent: "space-between", marginTop: 12 },
                ]}
              >
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
                  {(["dollars", "percent"] as const).map((value) => (
                    <View key={value} style={{ flex: 1 }}>
                      <Action
                        secondary={unit !== value}
                        label={value === "dollars" ? "Dollars" : "Percentages"}
                        onPress={() => {
                          setUnit(value);
                          setCustom({});
                        }}
                      />
                    </View>
                  ))}
                </View>
              )}
              {selectedPeople.map((person) => (
                <BillPanel key={person.id}>
                  <View style={styles.row}>
                    <Avatar name={person.name} size={40} />
                    <Label style={{ flex: 1 }}>{person.name}</Label>
                    {equal && (
                      <Label
                        style={{
                          color: theme.teal,
                          fontFamily: "Inter_600SemiBold",
                        }}
                      >
                        {money(review[person.id] ?? 0)}
                      </Label>
                    )}
                  </View>
                  {!equal && (
                    <Field
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
                  )}
                  {!equal &&
                    unit === "percent" &&
                    review[person.id] !== undefined && (
                      <Muted>
                        {money(review[person.id])} at the current estimate
                      </Muted>
                    )}
                  {kind === "flexible" && (
                    <Field
                      label="Personal maximum ($)"
                      value={caps[person.id] ?? ""}
                      placeholder="Proportional maximum"
                      keyboardType="decimal-pad"
                      onChangeText={(value) =>
                        setCaps({ ...caps, [person.id]: value })
                      }
                    />
                  )}
                </BillPanel>
              ))}
              <ErrorText text={calculationError} />
              <BillInfo>
                {kind === "flexible"
                  ? "Each person accepts their own maximum. If their calculated share exceeds it, the entire contribution stops; the difference is not passed to others."
                  : "Allocate the full bill before continuing. Equal shares use whole cents; any remainder is distributed in the listed order."}
              </BillInfo>
            </>
          )}
          {step === 4 && (
            <>
              <Muted>
                Choose a Card for this bill. You can also set it up later.
              </Muted>
              <Label style={billStyles.section}>Funding card</Label>
              <ResourceState
                loading={cards.loading}
                data={cards.data}
                error={cards.error}
                retry={cards.reload}
              />
              {cards.data?.items
                .filter(
                  (card) =>
                    card.hostId === user?.id && card.status !== "closed",
                )
                .map((card) => (
                  <Pressable
                    key={card.id}
                    accessibilityRole="radio"
                    accessibilityLabel={card.name}
                    accessibilityState={{
                      checked: cardId === card.id && !createCard,
                    }}
                    aria-checked={cardId === card.id && !createCard}
                    onPress={() => {
                      setCardId(card.id);
                      setCreateCard(false);
                    }}
                    style={{
                      gap: 8,
                      padding: 12,
                      borderWidth: 2,
                      borderColor:
                        cardId === card.id && !createCard
                          ? theme.teal
                          : "transparent",
                      borderRadius: 28,
                    }}
                  >
                    <CardPreview name={card.name} design={card.design} />
                  </Pressable>
                ))}
              <Row
                title="Create a new Card setup"
                icon="cards"
                right={<Label>{createCard ? "✓" : "+"}</Label>}
                onPress={() => {
                  setCreateCard(true);
                  setNewCardName(newCardName || name + " card");
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
              <Row
                title="Continue without a Card"
                right={<Label>{!cardId && !createCard ? "✓" : "○"}</Label>}
                onPress={() => {
                  setCreateCard(false);
                  setCardId(null);
                }}
              />
              <BillInfo>
                A Card setup is not an issued card. Connecting it does not move
                money or give contributors spending access.
              </BillInfo>
            </>
          )}
          {step === 5 && (
            <>
              <Muted>Confirm the people and funding setup.</Muted>
              <Label style={billStyles.section}>Funding card</Label>
              {createCard || selectedCard ? (
                <CardPreview
                  name={createCard ? newCardName : selectedCard!.name}
                  design={createCard ? "aurora" : selectedCard!.design}
                />
              ) : (
                <BillPanel>
                  <Title small>No Card attached</Title>
                  <Muted>You can connect one when you’re ready.</Muted>
                </BillPanel>
              )}
              <Label style={billStyles.section}>Attached Circle</Label>
              {circleId ? (
                <BillPerson
                  name={
                    circles.data?.items.find((item) => item.id === circleId)
                      ?.name ?? "Your Circle"
                  }
                  selected
                  onPress={() => setStep(2)}
                />
              ) : (
                <Row title="No Circle attached" onPress={() => setStep(2)} />
              )}
              <Label style={billStyles.section}>Contributions</Label>
              <BillPanel>
                <View style={styles.row}>
                  <BillIcon name={icon} />
                  <View style={{ flex: 1 }}>
                    <Title small>{name}</Title>
                    <Muted>
                      {money(moneyInput(amount))} · {frequency}
                    </Muted>
                  </View>
                </View>
                <Muted>Starts {dateLabel(date)}</Muted>
                {kind === "flexible" && (
                  <Muted>Bill maximum {money(moneyInput(maximum))}</Muted>
                )}
                {planningOnly ? (
                  <>
                    <Title small>No contributions scheduled</Title>
                    <Muted>Your private bill is saved for planning.</Muted>
                  </>
                ) : (
                  selectedPeople.map((person) => (
                    <View
                      key={person.id}
                      style={[styles.row, { justifyContent: "space-between" }]}
                    >
                      <Label style={{ flex: 1 }}>{person.name}</Label>
                      <Label>{money(review[person.id] ?? 0)}</Label>
                    </View>
                  ))
                )}
              </BillPanel>
              {original && (
                <Field
                  label="Reason for the change (optional)"
                  value={reason}
                  onChangeText={setReason}
                  multiline
                  maxLength={500}
                  placeholder="Explain the change in your own words"
                />
              )}
              <BillInfo>
                {planningOnly
                  ? "Saving this bill does not create contribution proposals or authorize a payment."
                  : "No contributions start until each person accepts their terms. Sending a proposal does not debit anyone’s account."}
              </BillInfo>
            </>
          )}
        </View>
      </AuthGate>
    </Shell>
  );
}
