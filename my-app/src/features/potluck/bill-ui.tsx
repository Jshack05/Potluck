import type { ReactNode } from "react";
import { Image } from "expo-image";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { Avatar, Label, Muted, theme, styles } from "@/design/system";

export const billIcons = {
  internet: require("../../../assets/potluck/bill/internet.svg"),
  phone: require("../../../assets/potluck/bill/phone.svg"),
  tv: require("../../../assets/potluck/bill/tv.svg"),
  lightning: require("../../../assets/potluck/bill/lightning.svg"),
  rent: require("../../../assets/potluck/bill/rent.svg"),
  water: require("../../../assets/potluck/bill/water.svg"),
  trash: require("../../../assets/potluck/bill/trash.svg"),
  groceries: require("../../../assets/potluck/bill/groceries.svg"),
  car: require("../../../assets/potluck/bill/car.svg"),
  insurance: require("../../../assets/potluck/bill/insurance.svg"),
  streaming: require("../../../assets/potluck/bill/streaming.svg"),
  medical: require("../../../assets/potluck/bill/medical.svg"),
  bill: require("../../../assets/potluck/bill/bill.svg"),
  utilities: require("../../../assets/potluck/bill/utilities.svg"),
  gas: require("../../../assets/potluck/bill/gas.svg"),
};
export const billColors = {
  teal: {
    hex: "#006D67",
    asset: require("../../../assets/potluck/bill/color-teal.svg"),
  },
  blue: {
    hex: "#3E5CF0",
    asset: require("../../../assets/potluck/bill/color-blue.svg"),
  },
  coral: {
    hex: "#EE5C7F",
    asset: require("../../../assets/potluck/bill/color-coral.svg"),
  },
  gold: {
    hex: "#EB9F17",
    asset: require("../../../assets/potluck/bill/color-gold.svg"),
  },
  purple: {
    hex: "#9757D2",
    asset: require("../../../assets/potluck/bill/color-purple.svg"),
  },
};
export type BillIconName = keyof typeof billIcons;
export type BillColorName = keyof typeof billColors;
export function BillIcon({
  name = "bill",
  size = 56,
  color = "teal",
}: {
  name?: string;
  size?: number;
  color?: BillColorName;
}) {
  const key = name in billIcons ? (name as BillIconName) : "bill";
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor:
          color === "teal" ? theme.mint : billColors[color].hex + "20",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        source={billIcons[key]}
        contentFit="contain"
        style={{
          width: key === "bill" ? 18.5 : 28,
          height: key === "bill" ? 21.7011 : 28,
          ...(key === "internet" ? { marginTop: 6 } : {}),
        }}
      />
    </View>
  );
}
export function Radio({ selected }: { selected: boolean }) {
  return (
    <Image
      source={
        selected
          ? require("../../../assets/potluck/bill/radio-selected.svg")
          : require("../../../assets/potluck/bill/radio.svg")
      }
      style={{ width: 28, height: 28 }}
      contentFit="contain"
    />
  );
}
export function BillOption({
  title,
  detail,
  selected,
  onPress,
}: {
  title: string;
  detail: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      aria-checked={selected}
      onPress={onPress}
      style={[
        billStyles.option,
        selected && { borderColor: theme.teal, backgroundColor: "#E6F6F0" },
      ]}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          borderWidth: 1,
          borderColor: selected ? theme.teal : "#C9DED8",
          backgroundColor: selected ? theme.teal : "white",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selected && (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "white",
            }}
          />
        )}
      </View>
      <Label
        style={{
          fontSize: 15,
          fontFamily: "Inter_600SemiBold",
          textAlign: "center",
        }}
      >
        {title}
      </Label>
      <Label
        style={{
          color: "#70817C",
          fontSize: 12,
          lineHeight: 16,
          textAlign: "center",
        }}
      >
        {detail}
      </Label>
    </Pressable>
  );
}
export function BillPanel({
  children,
  mint = false,
}: {
  children: ReactNode;
  mint?: boolean;
}) {
  return (
    <View style={[billStyles.panel, mint && { backgroundColor: theme.mint }]}>
      {children}
    </View>
  );
}
/** Figma's Bill field places its section heading separately from the input. */
export function BillInput(props: TextInputProps) {
  return (
    <TextInput
      {...props}
      placeholderTextColor={theme.muted}
      style={[styles.field, { borderRadius: 28 }, props.style]}
    />
  );
}
export function BillInfo({ children }: { children: ReactNode }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
        padding: 12,
        backgroundColor: "#EFEDE7",
        borderRadius: 16,
      }}
    >
      <Image
        source={require("../../../assets/potluck/bill/info.svg")}
        style={{ width: 24, height: 24 }}
      />
      <Label
        style={{ flex: 1, color: theme.muted, fontSize: 13, lineHeight: 19 }}
      >
        {children}
      </Label>
    </View>
  );
}
export function BillDetailRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 16,
        justifyContent: "space-between",
        paddingVertical: 10,
      }}
    >
      <Muted>{label}</Muted>
      <Label style={{ flexShrink: 1, textAlign: "right", fontSize: 14 }}>
        {value}
      </Label>
    </View>
  );
}
export function BillPerson({
  name,
  subtitle,
  selected,
  onPress,
}: {
  name: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={name}
      accessibilityState={{ checked: selected }}
      aria-checked={selected}
      onPress={onPress}
      style={[
        styles.row,
        { padding: 16, borderRadius: 24, backgroundColor: "white" },
      ]}
    >
      <Avatar name={name} size={40} />
      <View style={{ flex: 1 }}>
        <Label style={{ fontFamily: "Inter_600SemiBold" }}>{name}</Label>
        {subtitle && <Muted>{subtitle}</Muted>}
      </View>
      <Radio selected={selected} />
    </Pressable>
  );
}
export const billStyles = StyleSheet.create({
  panel: { backgroundColor: "white", borderRadius: 28, padding: 24, gap: 12 },
  option: {
    flex: 1,
    minHeight: 128,
    borderRadius: 22,
    padding: 16,
    gap: 9,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#C9DED8",
    alignItems: "center",
  },
  amount: {
    fontFamily: "Inter_700Bold",
    fontSize: 38,
    lineHeight: 48,
    color: theme.teal,
  },
  section: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    lineHeight: 28,
    marginTop: 12,
  },
});
