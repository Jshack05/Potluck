import { Image } from "expo-image";
import { View } from "react-native";
import { Label, Muted, Title, money, dateLabel, theme } from "@/design/system";
import { PlanningPanel } from "./planning-controls";
import type { Goal } from "./goal-model";
export function GoalIcon({ hero = false }: { hero?: boolean }) {
  return (
    <View
      style={{
        width: hero ? 64 : 56,
        height: hero ? 64 : 56,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#E6F6F0",
      }}
    >
      <Image
        source={
          hero
            ? require("../../../assets/potluck/goal-target-hero.svg")
            : require("../../../assets/potluck/goal-target.svg")
        }
        style={{ width: hero ? 36 : 24, height: hero ? 36 : 24 }}
        contentFit="contain"
      />
    </View>
  );
}
export function GoalSummary({
  goal,
}: {
  goal: Pick<
    Goal,
    | "name"
    | "kind"
    | "targetMinor"
    | "endDate"
    | "frequency"
    | "plannedContributions"
  >;
}) {
  const total = goal.plannedContributions.reduce(
    (sum, person) => sum + person.amountMinor,
    0,
  );
  return (
    <PlanningPanel>
      <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
        <GoalIcon />
        <View style={{ flex: 1 }}>
          <Title small>{goal.name || "Your Goal"}</Title>
          <Muted>
            {goal.kind === "target" ? "Target goal" : "Time-based goal"} ·{" "}
            {goal.plannedContributions.length}{" "}
            {goal.plannedContributions.length === 1 ? "person" : "people"}
          </Muted>
        </View>
      </View>
      <View style={{ paddingVertical: 8 }}>
        <Label
          style={{
            fontSize: 28,
            lineHeight: 36,
            color: theme.teal,
            fontFamily: "Inter_700Bold",
          }}
        >
          {goal.kind === "target" && goal.targetMinor !== null
            ? money(goal.targetMinor)
            : goal.endDate
              ? dateLabel(goal.endDate)
              : "Indefinite"}
        </Label>
        <Muted>
          {goal.kind === "target"
            ? "Planned target · funding has not started"
            : "Planned duration · funding has not started"}
        </Muted>
      </View>
      <View
        style={{ height: 10, borderRadius: 5, backgroundColor: "#E1ECE8" }}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <Muted>
          {money(total)} planned · {goal.frequency}
        </Muted>
        <Label
          style={{
            color: theme.teal,
            fontFamily: "Inter_600SemiBold",
            fontSize: 14,
          }}
        >
          Draft
        </Label>
      </View>
    </PlanningPanel>
  );
}
export function GoalBoundary() {
  return (
    <Muted>
      This Goal is a saved plan. No invitations have been sent, no contribution
      terms have been accepted, and no funds are locked or collected.
    </Muted>
  );
}
