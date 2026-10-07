import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Avatar, Label, Muted, theme } from "@/design/system";
export function Selection({ selected }: { selected: boolean }) {
  return (
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: selected ? 6 : 1.5,
        borderColor: selected ? theme.teal : "#70817C",
        backgroundColor: "white",
      }}
    />
  );
}
export function PlanningChoice({
  title,
  subtitle,
  selected,
  onPress,
  name,
  children,
}: {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  name?: string;
  children?: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      aria-checked={selected}
      onPress={onPress}
      style={{
        minHeight: 68,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: selected ? theme.teal : "transparent",
        backgroundColor: selected ? "#E6F6F0" : "white",
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
      }}
    >
      {name && <Avatar name={name} size={30} />}
      <View style={{ flex: 1, gap: 2 }}>
        <Label style={{ fontFamily: "Inter_600SemiBold" }}>{title}</Label>
        {subtitle && <Muted>{subtitle}</Muted>}
        {children}
      </View>
      <Selection selected={selected} />
    </Pressable>
  );
}
export function PlanningPanel({ children }: { children: ReactNode }) {
  return (
    <View
      style={{
        padding: 20,
        gap: 12,
        backgroundColor: "white",
        borderRadius: 24,
      }}
    >
      {children}
    </View>
  );
}
