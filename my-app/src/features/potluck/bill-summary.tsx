import { useState } from "react";
import { View, Pressable } from "react-native";
import {
  Label,
  Muted,
  ResourceState,
  Link,
  go,
  money,
  dateLabel,
  styles,
  theme,
} from "@/design/system";
import { LoadingFeedback } from "@/design/loading";
import { useResource } from "@/services/client";
type Occurrence = {
  billId: string;
  name: string;
  date: string;
  amountMinor: number;
  estimated: boolean;
  status: string;
};
type Summary = {
  totalMinor: number;
  occurrences: Occurrence[];
  planningTotalMinor?: number;
  planningOccurrences?: Occurrence[];
};
export function BillSummary({ scope }: { scope: "shared" | "all" }) {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)),
    [view, setView] = useState<"overview" | "week">("overview"),
    r = useResource<Summary>(
      "/bill-summary?scope=" + scope + "&month=" + month,
    );
  function shift(delta: number) {
    const [y, m] = month.split("-").map(Number);
    setMonth(
      new Date(Date.UTC(y, m - 1 + delta, 1, 12)).toISOString().slice(0, 7),
    );
  }
  const data = r.data,
    personal = data?.planningOccurrences ?? [],
    onlyPersonal = !data?.occurrences.length && personal.length > 0,
    next = [...(data?.occurrences ?? []), ...personal]
      .sort((a, b) => a.date.localeCompare(b.date))
      .find((x) => x.date >= new Date().toISOString().slice(0, 10));
  const weeks = Array.from({ length: 5 }, (_, i) => ({
    label: "Week " + (i + 1),
    amount:
      data?.occurrences
        .filter((x) => Math.floor((Number(x.date.slice(8)) - 1) / 7) === i)
        .reduce((s, x) => s + x.amountMinor, 0) ?? 0,
    planned: personal
      .filter((x) => Math.floor((Number(x.date.slice(8)) - 1) / 7) === i)
      .reduce((sum, x) => sum + x.amountMinor, 0),
  }));
  return (
    <View
      style={{
        padding: 18,
        backgroundColor: "white",
        borderRadius: 24,
        minHeight: 248,
        gap: 10,
      }}
    >
      <View style={[styles.row, { justifyContent: "space-between" }]}>
        {(["overview", "week"] as const).map((x) => (
          <Pressable
            key={x}
            accessibilityRole="tab"
            accessibilityState={{ selected: view === x }}
            aria-selected={view === x}
            onPress={() => setView(x)}
            style={{
              paddingVertical: 0,
              paddingBottom: 10,
              flex: 1,
              alignItems: "center",
              borderBottomWidth: 2,
              borderColor: view === x ? theme.teal : "transparent",
            }}
          >
            <Label
              style={{
                fontFamily: "Inter_600SemiBold",
                color: view === x ? theme.teal : theme.muted,
              }}
            >
              {x === "overview" ? "Overview" : "By week"}
            </Label>
          </Pressable>
        ))}
      </View>
      <View style={[styles.row, { justifyContent: "space-between" }]}>
        <Muted>
          {new Date(month + "-01T12:00:00").toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </Muted>
        <View style={{ flex: 1 }} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          onPress={() => shift(-1)}
          style={{ padding: 10 }}
        >
          <Label>‹</Label>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next month"
          onPress={() => shift(1)}
          style={{ padding: 10 }}
        >
          <Label>›</Label>
        </Pressable>
      </View>
      <ResourceState loading={false} error={r.error} retry={r.reload} />
      {!data && !r.error && <LoadingFeedback key={scope + month} />}
      {data &&
        (view === "overview" ? (
          <>
            <Muted>
              {onlyPersonal ? "Personal plans" : "Your agreed shares"}
              {(onlyPersonal ? personal : data.occurrences).some(
                (x) => x.estimated,
              )
                ? " · includes estimates"
                : ""}
            </Muted>
            <Label
              style={{
                fontSize: 36,
                lineHeight: 42,
                fontFamily: "Inter_700Bold",
                color: theme.teal,
              }}
            >
              {money(
                onlyPersonal ? (data.planningTotalMinor ?? 0) : data.totalMinor,
              )}
            </Label>
            {!onlyPersonal && personal.length > 0 && (
              <Muted>
                Personal plans
                {personal.some((x) => x.estimated) ? " (estimated)" : ""} ·{" "}
                {money(data.planningTotalMinor ?? 0)}
              </Muted>
            )}
            {next ? (
              <Link
                onPress={() =>
                  go(
                    "/bill/" +
                      next.billId +
                      (next.status === "draft"
                        ? ""
                        : "/payment?date=" + next.date),
                  )
                }
              >
                {next.status === "draft" ? "Planned · " : ""}
                {next.name} · {money(next.amountMinor)} · {dateLabel(next.date)}
              </Link>
            ) : (
              <Muted>No upcoming bills in this month.</Muted>
            )}
            <Muted>Planning total · no funding authorized</Muted>
          </>
        ) : (
          <>
            {weeks.map((w) => (
              <View
                key={w.label}
                style={[styles.row, { justifyContent: "space-between" }]}
              >
                <Muted>{w.label}</Muted>
                <View style={{ alignItems: "flex-end" }}>
                  <Label>
                    {onlyPersonal ? money(w.planned) : money(w.amount)}
                  </Label>
                  {!onlyPersonal && personal.length > 0 && (
                    <Muted>Planned · {money(w.planned)}</Muted>
                  )}
                </View>
              </View>
            ))}
            {personal.length > 0 && (
              <Muted>
                {onlyPersonal
                  ? "Personal plans"
                  : "Agreed shares and personal plans"}
                {personal.some((x) => x.estimated)
                  ? " · includes estimates"
                  : ""}
              </Muted>
            )}
          </>
        ))}
    </View>
  );
}
