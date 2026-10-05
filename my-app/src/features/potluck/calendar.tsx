import { useState } from "react";
import { View, Pressable } from "react-native";
import { Label, theme, styles } from "@/design/system";
import { monthCells } from "./calendar-model";
export function Calendar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [month, setMonth] = useState(
    () =>
      new Date((value || new Date().toISOString().slice(0, 10)) + "T12:00:00"),
  );
  const year = month.getFullYear(),
    index = month.getMonth();
  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 24,
        padding: 14,
        gap: 8,
      }}
    >
      <View style={[styles.row, { justifyContent: "space-between" }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          onPress={() => setMonth(new Date(year, index - 1, 1, 12))}
          style={{
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Label style={{ fontSize: 28, color: theme.teal }}>‹</Label>
        </Pressable>
        <Label style={{ fontFamily: "Inter_600SemiBold" }}>
          {month.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </Label>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next month"
          onPress={() => setMonth(new Date(year, index + 1, 1, 12))}
          style={{
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Label style={{ fontSize: 28, color: theme.teal }}>›</Label>
        </Pressable>
      </View>
      <View style={{ flexDirection: "row" }}>
        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
          <Label
            key={i}
            style={{
              width: "14.2857%",
              textAlign: "center",
              color: theme.muted,
              fontSize: 12,
            }}
          >
            {day}
          </Label>
        ))}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {monthCells(year, index).map((date, i) =>
          date ? (
            <Pressable
              key={date}
              accessibilityRole="button"
              accessibilityLabel={new Date(
                date + "T12:00:00",
              ).toLocaleDateString("en-US", { dateStyle: "full" })}
              accessibilityState={{ selected: date === value }}
              aria-selected={date === value}
              onPress={() => onChange(date)}
              style={{
                width: "14.2857%",
                minHeight: 44,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 22,
                backgroundColor: date === value ? theme.teal : "transparent",
              }}
            >
              <Label style={{ color: date === value ? "white" : theme.ink }}>
                {Number(date.slice(-2))}
              </Label>
            </Pressable>
          ) : (
            <View key={i} style={{ width: "14.2857%", height: 44 }} />
          ),
        )}
      </View>
    </View>
  );
}
