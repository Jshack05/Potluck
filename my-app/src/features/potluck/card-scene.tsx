import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  AuthGate,
  Label,
  Muted,
  ResourceState,
  Shell,
  theme,
  Icon,
} from "@/design/system";
import { useClient, useResource } from "@/services/client";
import type { Card } from "./types";
export type CardDetail = Card & {
  role: "host" | "trusted_spender";
  pendingMinor: number | null;
  reservedMinor: number | null;
  spenders: { id: string; name: string; status: string }[];
};
export function useCard() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { user } = useClient();
  return {
    id,
    user,
    ...useResource<CardDetail>(user && id ? "/cards/" + id : null),
  };
}
export function CardScene({
  title,
  children,
  footer,
}: {
  title: string;
  children: (card: CardDetail) => ReactNode;
  footer?: (card: CardDetail) => ReactNode;
}) {
  const card = useCard();
  return (
    <Shell
      title={title}
      back
      active="Cards"
      footer={card.data && footer?.(card.data)}
    >
      <AuthGate returnTo={"/card/" + card.id}>
        <ResourceState
          loading={card.loading}
          data={card.data}
          error={card.error}
          retry={card.reload}
        />
        {card.data && children(card.data)}
      </AuthGate>
    </Shell>
  );
}
export function CardLine({
  title,
  detail,
  icon,
  onPress,
}: {
  title: string;
  detail?: string;
  icon?: "cards" | "circles" | "bank" | "pending" | "bills";
  onPress?: () => void;
}) {
  const content = (
    <View
      style={{
        minHeight: 74,
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        borderBottomWidth: 1,
        borderColor: theme.line,
        paddingVertical: 16,
      }}
    >
      {icon && <Icon name={icon} />}
      <View style={{ flex: 1, gap: 4 }}>
        <Label style={{ fontFamily: "Inter_600SemiBold" }}>{title}</Label>
        {detail && <Muted>{detail}</Muted>}
      </View>
      {onPress && <Label style={{ color: theme.teal, fontSize: 24 }}>›</Label>}
    </View>
  );
  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {content}
    </Pressable>
  ) : (
    content
  );
}
