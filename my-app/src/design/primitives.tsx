import { Image } from "expo-image";
import { Text, View, type TextProps } from "react-native";
import type { ReactNode } from "react";
export const theme = {
  canvas: "#F3F2EF",
  blueCanvas: "#F2F9FD",
  ink: "#273432",
  muted: "#596562",
  teal: "#006D67",
  blue: "#287AAA",
  mint: "#E3F6F0",
  paleBlue: "#E4F1FC",
  line: "#D9E5E0",
  danger: "#AD3E48",
  amber: "#996300",
};
export const icons = {
  circles: require("../../assets/potluck/circles.svg"),
  cards: require("../../assets/potluck/cards.svg"),
  bills: require("../../assets/potluck/bills.svg"),
  pending: require("../../assets/potluck/pending.svg"),
  healthy: require("../../assets/potluck/health-good.svg"),
  attention: require("../../assets/potluck/health-attention.svg"),
  internet: require("../../assets/potluck/internet.svg"),
  phone: require("../../assets/potluck/phone.svg"),
  electric: require("../../assets/potluck/electric.svg"),
  groceries: require("../../assets/potluck/groceries.svg"),
  plus: require("../../assets/potluck/plus.svg"),
  back: require("../../assets/potluck/back.svg"),
  discover: require("../../assets/splitfinder/discover.svg"),
  inbox: require("../../assets/potluck/inbox.svg"),
  inboxBlue: require("../../assets/splitfinder/inbox.svg"),
  bank: require("../../assets/potluck/bank-house.svg"),
  agreement: require("../../assets/potluck/agreement-document.svg"),
  authLucky: require("../../assets/potluck/auth-lucky.svg"),
  lucky: require("../../assets/splitfinder/lucky.svg"),
  service: require("../../assets/splitfinder/service.png"),
  check: require("../../assets/splitfinder/check.svg"),
};
export function Label({ style, ...props }: TextProps) {
  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: "Inter_400Regular",
          fontSize: 16,
          lineHeight: 24,
          color: theme.ink,
        },
        style,
      ]}
    />
  );
}
export function Title({
  children,
  small = false,
}: {
  children: ReactNode;
  small?: boolean;
}) {
  return (
    <Label
      accessibilityRole="header"
      style={{
        fontFamily: "Inter_700Bold",
        fontSize: small ? 20 : 26,
        lineHeight: small ? 27 : 33,
      }}
    >
      {children}
    </Label>
  );
}
export function Muted({ children }: { children: ReactNode }) {
  return (
    <Label style={{ color: theme.muted, fontSize: 14, lineHeight: 21 }}>
      {children}
    </Label>
  );
}
export function Icon({
  name,
  size = 24,
}: {
  name: keyof typeof icons;
  size?: number;
}) {
  if (name === "inbox")
    return (
      <View
        style={{
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source={icons.inbox}
          contentFit="contain"
          style={{ width: (size * 17.8) / 24, height: (size * 15.8) / 24 }}
        />
      </View>
    );
  return (
    <Image
      source={icons[name]}
      contentFit="contain"
      style={{ width: size, height: size }}
    />
  );
}
