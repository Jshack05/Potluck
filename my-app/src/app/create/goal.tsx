import { useState } from "react";
import { View, Pressable, Switch } from "react-native";
import { router, useLocalSearchParams, type Href } from "expo-router";
import {
  Shell,
  AuthGate,
  Title,
  Muted,
  Field,
  Action,
  ErrorText,
  Link,
  Label,
  Row,
  Avatar,
  ResourceState,
  go,
  theme,
  money,
  dateLabel,
} from "@/design/system";
import { useCreationDraft } from "@/services/creation-draft";
import {
  useAction,
  useClient,
  useCommand,
  useResource,
} from "@/services/client";
import { CardPreview } from "@/features/potluck/card-preview";
import {
  PlanningChoice,
  PlanningPanel,
  Selection,
} from "@/features/potluck/planning-controls";
import {
  GoalIcon,
  GoalSummary,
  GoalBoundary,
} from "@/features/potluck/goal-ui";
import { goalDurationEnd, type Goal } from "@/features/potluck/goal-model";
import { Calendar } from "@/features/potluck/calendar";
import { moneyInput } from "@/features/potluck/calendar-model";
import type { Card, Circle, Collection } from "@/features/potluck/types";
type GoalFields = {
  name: string;
  kind: "target" | "time_based";
  target: string;
  durationUnit: "months" | "weeks" | "indefinite";
  durationCount: string;
  frequency: "monthly" | "weekly";
  date: string;
  circleId: string | null;
  cardId: string | null;
  people: string[];
  amounts: Record<string, string>;
  lockFundsRequested: boolean;
  showContributions: boolean;
  step: number;
};
function localToday() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}
function previewMoney(value: string) {
  try {
    return moneyInput(value);
  } catch {
    return 0;
  }
}
export default function CreateGoal() {
  const { user } = useClient(),
    params = useLocalSearchParams<{ circleId?: string; cardId?: string }>();
  return (
    <GoalForm
      key={
        (user?.id ?? "guest") +
        ":" +
        (params.cardId ?? params.circleId ?? "new")
      }
    />
  );
}
function GoalForm() {
  const params = useLocalSearchParams<{ circleId?: string; cardId?: string }>(),
    { user } = useClient(),
    command = useCommand(),
    action = useAction();
  const draft = useCreationDraft<GoalFields, Goal>(
    user
      ? "potluck.draft.goal." +
          user.id +
          "." +
          (params.cardId ?? params.circleId ?? "new")
      : null,
    {
      name: "",
      kind: "target",
      target: "",
      durationUnit: "months",
      durationCount: "6",
      frequency: "monthly",
      date: localToday(),
      circleId: params.circleId ?? null,
      cardId: params.cardId ?? null,
      people: [],
      amounts: {},
      lockFundsRequested: false,
      showContributions: false,
      step: 0,
    },
  );
  const f = draft.fields,
    step = draft.resuming ? 7 : f.step,
    [error, setError] = useState("");
  const circles = useResource<Collection<Circle>>(user ? "/circles" : null),
    cards = useResource<Collection<Card>>(user ? "/cards" : null),
    circle = useResource<Circle>(f.circleId ? "/circles/" + f.circleId : null);
  const visiblePeople =
    circle.data?.people ?? (user ? [{ id: user.id, name: user.name }] : []);
  const people = visiblePeople.filter((p) => f.people.includes(p.id));
  const plannedContributions = people.map((p) => ({
    personId: p.id,
    name: p.name,
    amountMinor: previewMoney(f.amounts[p.id] ?? ""),
  }));
  let endDate: string | null = null;
  try {
    if (f.kind === "time_based")
      endDate = goalDurationEnd(
        f.date,
        f.durationUnit,
        Number(f.durationCount),
      );
  } catch {
    /* The next action reports invalid duration. */
  }
  const summary = {
    name: f.name,
    kind: f.kind,
    targetMinor: f.kind === "target" ? previewMoney(f.target) : null,
    endDate,
    frequency: f.frequency,
    plannedContributions,
  };
  const titles = [
    "Create Goal",
    f.kind === "target" ? "Target amount" : "Goal duration",
    "Attach to Circle",
    "Choose people",
    "Allocate contributions",
    "Charge schedule",
    "Attach to card",
    "Review goal",
  ];
  function setStep(value: number) {
    setError("");
    draft.update("step", value);
  }
  function chooseCircle(id: string | null) {
    if (id !== f.circleId) {
      draft.update("people", []);
      draft.update("amounts", {});
      draft.update("showContributions", false);
      draft.update("cardId", null);
    }
    draft.update("circleId", id);
  }
  function validate() {
    if (draft.resuming) return;
    if (!f.name.trim()) throw new Error("Give your Goal a name.");
    if (
      (step === 1 || step === 7) &&
      f.kind === "target" &&
      moneyInput(f.target) <= 0
    )
      throw new Error("Choose a positive target amount.");
    if ((step === 1 || step === 7) && f.kind === "time_based")
      goalDurationEnd(f.date, f.durationUnit, Number(f.durationCount));
    if (
      (step === 4 || step === 7) &&
      people.some((p) => moneyInput(f.amounts[p.id] ?? "") <= 0)
    )
      throw new Error(
        "Enter a positive contribution for each selected person.",
      );
    if ((step === 3 || step === 7) && people.length !== f.people.length)
      throw new Error(
        "The selected people changed. Choose the available people again.",
      );
  }
  function next() {
    try {
      validate();
      setError("");
      if (step < 7) setStep(step + 1);
      else
        void action.run(async () => {
          const goal = await draft.submit(
            {
              name: f.name,
              kind: f.kind,
              targetMinor: summary.targetMinor,
              endDate,
              frequency: f.frequency,
              firstContributionDate: f.date,
              circleId: f.circleId,
              cardId: f.cardId,
              plannedContributions: plannedContributions.map(
                ({ personId, amountMinor }) => ({ personId, amountMinor }),
              ),
              lockFundsRequested: f.lockFundsRequested,
              showContributions: f.showContributions,
            },
            (body, identity) => command<Goal>("/goals", body, identity),
          );
          router.replace(("/goal/" + goal.id) as Href);
          await draft.clear();
        });
    } catch (e) {
      setError((e as Error).message);
    }
  }
  const circleName = circles.data?.items.find((c) => c.id === f.circleId)?.name;
  return (
    <Shell
      title={titles[step]}
      back
      hideNavigation
      active="Cards"
      onBack={() =>
        step > 0 && !draft.locked ? setStep(step - 1) : router.back()
      }
      footer={
        user && (
          <>
            <ErrorText text={error || action.error || draft.error} />
            {!draft.ready && draft.error && (
              <Link onPress={draft.retry}>Retry draft</Link>
            )}
            <Action
              label={
                action.busy
                  ? "Saving…"
                  : step === 7
                    ? draft.resuming
                      ? "Finish saving Goal"
                      : "Save Goal plan"
                    : "Continue"
              }
              disabled={
                !draft.ready || action.busy || (step === 3 && circle.loading)
              }
              onPress={next}
            />
          </>
        )
      }
    >
      <AuthGate returnTo="/create/goal">
        {step === 0 && (
          <>
            <Muted>Set up a shared purpose people can steadily fund.</Muted>
            <View style={{ alignItems: "center", marginVertical: 16, gap: 8 }}>
              <GoalIcon hero />
              <Label style={{ color: theme.teal }}>Goal</Label>
            </View>
            <Field
              label="Goal name"
              placeholder="What are you working toward?"
              value={f.name}
              maxLength={80}
              onChangeText={(value) => draft.update("name", value)}
              style={{ borderRadius: 28 }}
            />
            <Title small>How should this goal end?</Title>
            <View style={{ flexDirection: "row", gap: 14 }}>
              {(["target", "time_based"] as const).map((kind) => (
                <Pressable
                  key={kind}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: f.kind === kind }}
                  aria-checked={f.kind === kind}
                  onPress={() => draft.update("kind", kind)}
                  style={{
                    flex: 1,
                    minHeight: 128,
                    gap: 12,
                    padding: 16,
                    alignItems: "center",
                    borderRadius: 22,
                    borderWidth: 1,
                    borderColor: f.kind === kind ? theme.teal : theme.line,
                    backgroundColor: f.kind === kind ? "#E6F6F0" : "white",
                  }}
                >
                  <Selection selected={kind === f.kind} />
                  <Label
                    style={{ fontFamily: "Inter_600SemiBold", fontSize: 15 }}
                  >
                    {kind === "target" ? "Target amount" : "Time-based goal"}
                  </Label>
                  <Muted>
                    {kind === "target"
                      ? "Stops when funded."
                      : "Runs for a chosen period."}
                  </Muted>
                </Pressable>
              ))}
            </View>
            <Row
              title={f.kind === "target" ? "Total goal" : "Goal duration"}
              subtitle={
                f.kind === "target"
                  ? f.target
                    ? money(previewMoney(f.target))
                    : "Choose an amount next"
                  : "Set months, weeks, or indefinite next"
              }
              onPress={() => setStep(1)}
            />
            <Title small>Goal settings</Title>
            <PlanningPanel>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <View style={{ flex: 1 }}>
                  <Label style={{ fontFamily: "Inter_600SemiBold" }}>
                    Lock funds
                  </Label>
                  <Muted>Preference only · subject to program approval.</Muted>
                </View>
                <Switch
                  accessibilityLabel="Request funds release at Goal end"
                  value={f.lockFundsRequested}
                  onValueChange={(v) => draft.update("lockFundsRequested", v)}
                  trackColor={{ true: theme.teal, false: "#D3DDDA" }}
                />
              </View>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <View style={{ flex: 1 }}>
                  <Label style={{ fontFamily: "Inter_600SemiBold" }}>
                    Show contributions
                  </Label>
                  <Muted>Choose a non-anonymous Circle first.</Muted>
                </View>
                <Switch
                  accessibilityLabel="Show contributions"
                  disabled={circle.data?.privacy !== "normal"}
                  value={f.showContributions}
                  onValueChange={(v) => draft.update("showContributions", v)}
                  trackColor={{ true: theme.teal, false: "#D3DDDA" }}
                />
              </View>
            </PlanningPanel>
          </>
        )}
        {step === 1 && (
          <>
            <Muted>Choose when the recurring contribution would end.</Muted>
            {f.kind === "target" ? (
              <>
                <PlanningPanel>
                  <Field
                    label="Total settled contributions"
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    value={f.target}
                    onChangeText={(v) => draft.update("target", v)}
                    style={{
                      borderWidth: 0,
                      textAlign: "center",
                      fontSize: 36,
                      fontFamily: "Inter_700Bold",
                      color: theme.teal,
                    }}
                  />
                </PlanningPanel>
                <Title small>Choose an amount</Title>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  {[600, 1200, 2000].map((value) => (
                    <Pressable
                      key={value}
                      accessibilityRole="button"
                      onPress={() => draft.update("target", String(value))}
                      style={{
                        flex: 1,
                        paddingVertical: 18,
                        borderRadius: 22,
                        borderWidth: 1,
                        borderColor:
                          f.target === String(value) ? theme.teal : theme.line,
                        backgroundColor:
                          f.target === String(value) ? theme.mint : "white",
                        alignItems: "center",
                      }}
                    >
                      <Label
                        style={{
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 18,
                        }}
                      >
                        {money(value * 100)}
                      </Label>
                    </Pressable>
                  ))}
                </View>
                <Muted>
                  Only settled contributions would count toward the target.
                  Funding has not started.
                </Muted>
              </>
            ) : (
              <>
                {(["months", "weeks", "indefinite"] as const).map((unit) => (
                  <PlanningChoice
                    key={unit}
                    title={
                      unit === "indefinite"
                        ? "Indefinite"
                        : unit === "months"
                          ? "Months"
                          : "Weeks"
                    }
                    selected={f.durationUnit === unit}
                    onPress={() => draft.update("durationUnit", unit)}
                  />
                ))}
                {f.durationUnit !== "indefinite" && (
                  <Field
                    label={"Number of " + f.durationUnit}
                    keyboardType="number-pad"
                    value={f.durationCount}
                    onChangeText={(v) => draft.update("durationCount", v)}
                  />
                )}
                <Muted>
                  {endDate
                    ? "Planned end: " + dateLabel(endDate)
                    : "Continues until the contributor cancels, if activated later."}
                </Muted>
              </>
            )}
          </>
        )}
        {step === 2 && (
          <>
            <Muted>Keep this goal with the people it belongs to.</Muted>
            <Title small>Choose a Circle</Title>
            <ResourceState
              loading={circles.loading}
              data={circles.data}
              error={circles.error}
              retry={circles.reload}
            />
            {circles.data?.items
              .filter((c) => c.privacy === "normal" || c.hostId === user?.id)
              .map((c) => (
                <PlanningChoice
                  key={c.id}
                  title={c.name}
                  name={c.name}
                  subtitle={
                    c.privacy === "anonymous"
                      ? "Anonymous Circle"
                      : "Shared space"
                  }
                  selected={f.circleId === c.id}
                  onPress={() => chooseCircle(c.id)}
                />
              ))}
            <PlanningChoice
              title="No Circle — just for me"
              selected={!f.circleId}
              onPress={() => chooseCircle(null)}
            />
            <Row
              title="Create a new Circle"
              icon="plus"
              onPress={() => go("/create/circle")}
            />
          </>
        )}
        {step === 3 && (
          <>
            <Muted>Plan who you would like to contribute.</Muted>
            <Title small>Who is contributing?</Title>
            <ResourceState
              loading={circle.loading}
              data={circle.data}
              error={circle.error}
              retry={circle.reload}
            />
            <PlanningPanel>
              {visiblePeople.map((person) => (
                <PlanningChoice
                  key={person.id}
                  title={person.name}
                  name={person.name}
                  subtitle={person.id === user?.id ? "You" : "Circle member"}
                  selected={f.people.includes(person.id)}
                  onPress={() =>
                    draft.update(
                      "people",
                      f.people.includes(person.id)
                        ? f.people.filter((id) => id !== person.id)
                        : [...f.people, person.id],
                    )
                  }
                />
              ))}
              <Row
                title="Invite someone"
                subtitle="Circle invitations are separate from Goal terms."
                icon="plus"
                onPress={() =>
                  f.circleId
                    ? go("/circle/" + f.circleId + "/invite")
                    : setStep(2)
                }
              />
            </PlanningPanel>
            <Title small>What each person would agree to</Title>
            <Row
              title="Individual contributions"
              subtitle="Set an amount for each selected person next."
            />
            <Row
              title="Attach to a Circle"
              subtitle={circleName ?? "Optional shared space"}
              onPress={() => setStep(2)}
            />
            <Muted>
              No invitations are sent when you save this plan. Each person must
              accept their own terms before future funding.
            </Muted>
          </>
        )}
        {step === 4 && (
          <>
            <Muted>
              Set a {f.frequency === "weekly" ? "weekly" : "monthly"} amount for
              each person.
            </Muted>
            <PlanningPanel>
              <Muted>Planned total</Muted>
              <Label
                style={{
                  textAlign: "center",
                  fontSize: 34,
                  lineHeight: 42,
                  fontFamily: "Inter_700Bold",
                  color: theme.teal,
                }}
              >
                {money(
                  plannedContributions.reduce(
                    (sum, p) => sum + p.amountMinor,
                    0,
                  ),
                )}
              </Label>
            </PlanningPanel>
            <Title small>Individual allocations</Title>
            {people.map((p) => (
              <PlanningPanel key={p.id}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <Avatar name={p.name} />
                  <View style={{ flex: 1 }}>
                    <Field
                      label={p.name + "’s contribution"}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      value={f.amounts[p.id] ?? ""}
                      onChangeText={(value) =>
                        draft.update("amounts", { ...f.amounts, [p.id]: value })
                      }
                    />
                  </View>
                </View>
              </PlanningPanel>
            ))}
            {!people.length && (
              <Muted>
                You can save a Goal plan without contributors and review the
                intended terms later.
              </Muted>
            )}
            <Muted>
              Each person must accept their own contribution and choose a
              funding source before charging begins.
            </Muted>
          </>
        )}
        {step === 5 && (
          <>
            <Muted>Choose when recurring contributions would happen.</Muted>
            <Title small>Frequency</Title>
            <View style={{ flexDirection: "row", gap: 12 }}>
              {(["monthly", "weekly"] as const).map((frequency) => (
                <View key={frequency} style={{ flex: 1 }}>
                  <PlanningChoice
                    title={frequency === "monthly" ? "Monthly" : "Weekly"}
                    selected={f.frequency === frequency}
                    onPress={() => draft.update("frequency", frequency)}
                  />
                </View>
              ))}
            </View>
            <Title small>First contribution date</Title>
            <Calendar
              value={f.date}
              onChange={(value) => draft.update("date", value)}
            />
            <Muted>
              Planned start: {dateLabel(f.date)}. This schedule does not
              authorize collection.
            </Muted>
          </>
        )}
        {step === 6 && (
          <>
            <Muted>Choose a Card for this goal.</Muted>
            <Title small>Choose a Card</Title>
            <ResourceState
              loading={cards.loading}
              data={cards.data}
              error={cards.error}
              retry={cards.reload}
            />
            {cards.data?.items
              .filter((c) => !c.circleId || c.circleId === f.circleId)
              .map((c) => (
                <Pressable
                  key={c.id}
                  accessibilityRole="radio"
                  accessibilityLabel={c.name}
                  accessibilityState={{ checked: f.cardId === c.id }}
                  aria-checked={f.cardId === c.id}
                  onPress={() => draft.update("cardId", c.id)}
                  style={{
                    gap: 8,
                    padding: 8,
                    borderRadius: 24,
                    borderWidth: 1,
                    borderColor: f.cardId === c.id ? theme.teal : "transparent",
                  }}
                >
                  <CardPreview name={c.name} design={c.design} />
                  <Label style={{ textAlign: "center", color: theme.muted }}>
                    {f.cardId === c.id ? "Selected" : "Select Card"}
                  </Label>
                </Pressable>
              ))}
            <PlanningChoice
              title="No Card for now"
              selected={!f.cardId}
              onPress={() => draft.update("cardId", null)}
            />
          </>
        )}
        {step === 7 && (
          <>
            <Muted>Check your plan before you save it.</Muted>
            <GoalSummary goal={summary} />
            <Title small>Proposal terms</Title>
            <PlanningPanel>
              <Label style={{ fontFamily: "Inter_600SemiBold" }}>
                {f.frequency === "weekly" ? "Weekly" : "Monthly"} contributions
              </Label>
              {plannedContributions.map((p) => (
                <View
                  key={p.personId}
                  style={{
                    flexDirection: "row",
                    gap: 12,
                    alignItems: "center",
                    paddingVertical: 8,
                  }}
                >
                  <Avatar name={p.name} size={32} />
                  <Label style={{ flex: 1 }}>{p.name}</Label>
                  <Label style={{ color: theme.teal }}>
                    {money(p.amountMinor)}
                  </Label>
                </View>
              ))}
              {!people.length && <Muted>No contributors selected.</Muted>}
            </PlanningPanel>
            <Row
              title="Stop condition"
              subtitle={
                f.kind === "target"
                  ? "Once " + money(summary.targetMinor ?? 0) + " is settled"
                  : endDate
                    ? dateLabel(endDate)
                    : "Until canceled"
              }
            />
            <Row
              title="First contribution"
              subtitle={dateLabel(f.date) + ", then " + f.frequency}
            />
            <Row title="Attached Circle" subtitle={circleName ?? "None"} />
            <Row
              title="Attached Card"
              subtitle={
                cards.data?.items.find((c) => c.id === f.cardId)?.name ?? "None"
              }
            />
            <GoalBoundary />
          </>
        )}
      </AuthGate>
    </Shell>
  );
}
