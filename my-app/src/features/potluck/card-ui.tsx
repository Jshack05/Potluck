import type { ReactNode } from "react";
import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";
import { Label, theme } from "@/design/system";
import { CircleAvatar } from "./circle-ui";

// Sources: 1077:5751, 859:3437, 854:3515, 756:3028, 793:3176.
// These variants belong to Cards; generic planning rows retain their own layout.
export function CardHeading({ children }: { children: ReactNode }) {
  return (
    <Label accessibilityRole="header" style={styles.heading}>
      {children}
    </Label>
  );
}
export function CardHint({ children }: { children: ReactNode }) {
  return <Label style={styles.hint}>{children}</Label>;
}
export function CardSelection({
  selected,
  light = false,
}: {
  selected: boolean;
  light?: boolean;
}) {
  return (
    <View
      style={[
        styles.radio,
        {
          borderColor: light ? "white" : selected ? theme.teal : theme.muted,
          backgroundColor: light ? "transparent" : "white",
        },
      ]}
    >
      {selected && <View style={styles.radioCore} />}
    </View>
  );
}
export function CardChevron() {
  return (
    <Image
      source={require("../../../assets/potluck/card-flow/chevron.svg")}
      style={{ width: 20, height: 20 }}
      contentFit="contain"
    />
  );
}
export function CardCircleChoice({
  title,
  subtitle,
  selected,
  disabled,
  onPress,
}: {
  title: string;
  subtitle?: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={title}
      accessibilityState={{ checked: selected, disabled: !!disabled }}
      aria-checked={selected}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.choice,
        !subtitle && styles.compactChoice,
        selected && styles.selected,
      ]}
    >
      {subtitle && <CircleAvatar name={title} size={28} />}
      <View style={{ flex: 1, gap: 2 }}>
        <Label style={styles.rowTitle}>{title}</Label>
        {subtitle && (
          <Label style={{ fontSize: 13, lineHeight: 17, color: "#70817C" }}>
            {subtitle}
          </Label>
        )}
      </View>
      <View style={{ marginRight: 20 }}>
        <CardSelection selected={selected} />
      </View>
    </Pressable>
  );
}
export function CardCreateCircle({
  disabled,
  onPress,
}: {
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Create a new Circle"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.compactChoice, styles.create]}
    >
      <View style={{ width: 24, height: 24, opacity: 0.72 }}>
        <View
          style={{
            position: "absolute",
            left: 6,
            top: 11,
            width: 12,
            height: 2,
            borderRadius: 1,
            backgroundColor: theme.teal,
          }}
        />
        <View
          style={{
            position: "absolute",
            left: 11,
            top: 6,
            width: 2,
            height: 12,
            borderRadius: 1,
            backgroundColor: theme.teal,
          }}
        />
      </View>
      <Label style={[styles.rowTitle, { flex: 1, color: theme.muted }]}>
        Create a new Circle
      </Label>
      <View style={{ marginRight: 20, opacity: 0.72 }}>
        <CardChevron />
      </View>
    </Pressable>
  );
}
export function CardReviewRow({
  title,
  subtitle,
  circle,
  onPress,
}: {
  title: string;
  subtitle?: string;
  circle?: boolean;
  onPress?: () => void;
}) {
  const content = (
    <>
      {circle && <CircleAvatar name={title} size={38} />}
      <View style={{ flex: 1, gap: 2 }}>
        <Label
          style={[
            styles.rowTitle,
            circle && {
              fontFamily: "Inter_700Bold",
              fontSize: 20,
              lineHeight: 24,
            },
          ]}
        >
          {title}
        </Label>
        {subtitle && (
          <Label style={{ color: "#70817C", fontSize: 14, lineHeight: 18 }}>
            {subtitle}
          </Label>
        )}
      </View>
      {onPress && <CardChevron />}
    </>
  );
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.reviewRow, circle && styles.circleReview]}
    >
      {content}
    </Pressable>
  ) : (
    <View style={[styles.reviewRow, circle && styles.circleReview]}>
      {content}
    </View>
  );
}

// 583:2106 surface, 589:2161 eye, 575:2078 dollar, 575:2077 snowflake.
export function CardAction({
  label,
  icon,
  onPress,
  disabled = false,
  hint,
}: {
  label: string;
  icon: "eye" | "fund" | "freeze";
  onPress?: () => void;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={styles.action}
    >
      {icon === "fund" ? (
        <Label
          style={{
            width: 24,
            textAlign: "center",
            color: theme.teal,
            fontFamily: "Inter_700Bold",
            fontSize: 22,
            lineHeight: 24,
          }}
        >
          $
        </Label>
      ) : (
        <Image
          source={
            icon === "eye"
              ? require("../../../assets/potluck/card-flow/eye.svg")
              : require("../../../assets/potluck/card-flow/freeze.svg")
          }
          style={{ width: 24, height: 24 }}
          contentFit="contain"
        />
      )}
      <Label
        style={{
          fontFamily: "Inter_700Bold",
          fontSize: 12,
          lineHeight: 16,
          flexShrink: 1,
        }}
      >
        {label}
      </Label>
    </Pressable>
  );
}
export function CardMenu({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Card settings"
      onPress={onPress}
      style={styles.menu}
    >
      {[0, 1, 2].map((line) => (
        <View
          key={line}
          style={{
            width: 18,
            height: 2,
            borderRadius: 1,
            backgroundColor: theme.teal,
          }}
        />
      ))}
    </Pressable>
  );
}
export function CardSettingsGroup({ children }: { children: ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 28,
        paddingHorizontal: 24,
        paddingVertical: 14,
      }}
    >
      {children}
    </View>
  );
}
export function CardSetting({
  title,
  value,
  description,
  last = false,
  onPress,
}: {
  title: string;
  value?: string;
  description?: string;
  last?: boolean;
  onPress?: () => void;
}) {
  const content = (
    <>
      <View style={{ flex: 1, gap: 5 }}>
        <Label
          style={{
            fontSize: description ? 14 : 13,
            lineHeight: 18,
            color: description ? theme.ink : "#70817C",
            fontFamily: description ? "Inter_600SemiBold" : "Inter_400Regular",
          }}
        >
          {title}
        </Label>
        {description && (
          <Label style={{ color: "#70817C", fontSize: 11, lineHeight: 16 }}>
            {description}
          </Label>
        )}
      </View>
      {value && (
        <Label
          style={{
            flexShrink: 1,
            textAlign: "right",
            fontFamily: "Inter_600SemiBold",
            fontSize: 13,
            lineHeight: 18,
            color: onPress ? theme.teal : theme.ink,
          }}
        >
          {value}
        </Label>
      )}
      {onPress && <CardChevron />}
    </>
  );
  const rowStyle = {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    minHeight: description ? 60 : 31,
    paddingVertical: 6,
    borderBottomWidth: last ? 0 : 1,
    borderColor: theme.line,
  };
  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress} style={rowStyle}>
      {content}
    </Pressable>
  ) : (
    <View style={rowStyle}>{content}</View>
  );
}
const styles = StyleSheet.create({
  circleReview: {
    borderRadius: 32,
    paddingLeft: 24,
    gap: 22,
    boxShadow: "0px 6px 14px rgba(0,0,0,0.08)",
  },
  heading: { fontFamily: "Inter_700Bold", fontSize: 22, lineHeight: 28 },
  hint: { fontSize: 15, lineHeight: 19, color: "#70817C" },
  rowTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16, lineHeight: 20 },
  choice: {
    minHeight: 68,
    borderRadius: 22,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "transparent",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  compactChoice: {
    minHeight: 52,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#C9DED8",
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  selected: { borderColor: theme.teal, backgroundColor: "#E5F5ED" },
  create: { backgroundColor: "#F9FCFB" },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioCore: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.teal,
  },
  reviewRow: {
    minHeight: 64,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  action: {
    flex: 1,
    minHeight: 44,
    borderRadius: 13,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    boxShadow: "0px 8px 10px rgba(0,0,0,0.08)",
  },
  menu: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
});
