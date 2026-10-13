import { StyleSheet, View } from "react-native";
import { Label, theme } from "@/design/primitives";
import { CardThumbnail } from "./card-thumbnail";
import type { Card } from "./types";

// Figma 2351:47499: the miniature shows only the user's name.
export function CardContext({
  card,
  fullName,
  roleLabel,
}: {
  card: Pick<Card, "name" | "design">;
  fullName: string;
  roleLabel?: string;
}) {
  return (
    <View style={styles.context}>
      <CardThumbnail design={card.design} fullName={fullName} />
      <Label style={styles.name}>{card.name}</Label>
      {roleLabel && (
        <View style={styles.badge}>
          <Label style={styles.role}>{roleLabel}</Label>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  context: {
    minHeight: 88,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  name: {
    flex: 1,
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    lineHeight: 23,
  },
  badge: {
    backgroundColor: theme.mint,
    padding: 4,
    borderRadius: 12,
    maxWidth: 90,
  },
  role: { color: theme.teal, fontSize: 14, lineHeight: 20 },
});
