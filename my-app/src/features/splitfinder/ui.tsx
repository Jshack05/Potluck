import { type ReactNode } from "react";
import {
  StyleSheet,
  Text,
  type StyleProp,
  type TextStyle,
} from "react-native";

export const colors = {
  canvas: "#F2F9FD",
  ink: "#273432",
  secondary: "#596562",
  blue: "#287AAA",
  pale: "#E4F1FC",
  green: "#006D67",
  mint: "#DDF3E9",
  line: "#DCE7EC",
};

export function Txt({
  children,
  style,
  ...props
}: React.ComponentProps<typeof Text>) {
  return (
    <Text {...props} style={[s.text, style]}>
      {children}
    </Text>
  );
}

export function Heading({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Txt accessibilityRole="header" style={[s.heading, style]}>
      {children}
    </Txt>
  );
}

const s = StyleSheet.create({
  text: { fontSize: 16, lineHeight: 23, color: colors.ink },
  heading: { fontSize: 26, lineHeight: 33, fontWeight: "700" },
});
