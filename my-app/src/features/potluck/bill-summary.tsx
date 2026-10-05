import { useState } from "react";
import { View, Pressable } from "react-native";
import {
  Label,
  Muted,
  Title,
  ResourceState,
  Link,
  go,
  money,
  dateLabel,
  styles,
  theme,
} from "@/design/system";
import { useResource } from "@/services/client";
type Summary = {
  totalMinor: number;
  occurrences: {
    billId: string;
    name: string;
    date: string;
    amountMinor: number;
    estimated: boolean;
    status: string;
  }[];
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
    next = data?.occurrences.find(
      (x) => x.date >= new Date().toISOString().slice(0, 10),
    );
  const weeks = Array.from({ length: 5 }, (_, i) => ({
    label: "Week " + (i + 1),
    amount:
      data?.occurrences
        .filter((x) => Math.floor((Number(x.date.slice(8)) - 1) / 7) === i)
        .reduce((s, x) => s + x.amountMinor, 0) ?? 0,
  }));
  return (
    <View
      style={{
        padding: 18,
        backgroundColor: "white",
        borderRadius: 24,
        minHeight: 294,
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
              paddingVertical: 10,
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          onPress={() => shift(-1)}
          style={{ padding: 10 }}
        >
          <Label>‹</Label>
        </Pressable>
        <Title small>
          {new Date(month + "-01T12:00:00").toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </Title>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next month"
          onPress={() => shift(1)}
          style={{ padding: 10 }}
        >
          <Label>›</Label>
        </Pressable>
      </View>
      <ResourceState
        loading={r.loading && !data}
        error={r.error}
        retry={r.reload}
      />
      {data &&
        (view === "overview" ? (
          <>
            <Muted>
              Your agreed shares
              {data.occurrences.some((x) => x.estimated)
                ? " · includes estimates"
                : ""}
            </Muted>
            <Label
              style={{
                fontSize: 34,
                lineHeight: 42,
                fontFamily: "Inter_700Bold",
                color: theme.teal,
              }}
            >
              {money(data.totalMinor)}
            </Label>
            {next ? (
              <Link onPress={() => go("/bill/" + next.billId)}>
                {next.name} · {money(next.amountMinor)} · {dateLabel(next.date)}
              </Link>
            ) : (
              <Muted>No upcoming agreed shares in this month.</Muted>
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
                <Label>{money(w.amount)}</Label>
              </View>
            ))}
          </>
        ))}
    </View>
  );
}
