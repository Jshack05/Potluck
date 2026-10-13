import type { ReactNode } from "react";
import { View, Pressable } from "react-native";
import { Image } from "expo-image";
import { Label, Muted, Icon } from "@/design/system";
import { CircleAvatar, CircleGlyph } from "./circle-ui";
import { CardHeading } from "./card-ui";

// Role rows in 1606:19916 and 1606:20151; presentation never implies a grant.
export function CardPersonRow({
  name,
  detail,
  onPress,
}: {
  name: string;
  detail: string;
  onPress?: () => void;
}) {
  return RoleRow({
    name,
    detail,
    onPress,
    leading: <CircleAvatar name={name} size={44} />,
  });
}
export function CardPermissionRow({
  title,
  detail,
  icon,
  onPress,
}: {
  title: string;
  detail: string;
  icon: "cards" | "circles" | "shield";
  onPress?: () => void;
}) {
  return RoleRow({
    name: title,
    detail,
    onPress,
    leading:
      icon === "shield" ? <CircleGlyph name="shield" /> : <Icon name={icon} />,
  });
}
function RoleRow({
  name,
  detail,
  leading,
  onPress,
}: {
  name: string;
  detail: string;
  leading: ReactNode;
  onPress?: () => void;
}) {
  const content = (
    <>
      {leading}
      <View style={{ flex: 1, gap: 4 }}>
        <Label
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 16,
            lineHeight: 23,
          }}
        >
          {name}
        </Label>
        <Muted>{detail}</Muted>
      </View>
    </>
  );
  const style = {
    backgroundColor: "white",
    borderRadius: 22,
    minHeight: 80,
    padding: 16,
    gap: 14,
    flexDirection: "row" as const,
    alignItems: "center" as const,
  };
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      onPress={onPress}
      style={style}
    >
      {content}
    </Pressable>
  ) : (
    <View style={style}>{content}</View>
  );
}
export function CardPersonHeading({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        marginVertical: 12,
      }}
    >
      <CircleAvatar name={name} size={52} />
      <View style={{ flex: 1 }}>
        <CardHeading>{children}</CardHeading>
      </View>
    </View>
  );
}
export function CardPeopleInfo({ children }: { children: ReactNode }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginTop: 12,
      }}
    >
      <Image
        source={require("../../../assets/potluck/bill/info.svg")}
        style={{ width: 20, height: 20 }}
        contentFit="contain"
      />
      <View style={{ flex: 1 }}>
        <Muted>{children}</Muted>
      </View>
    </View>
  );
}
