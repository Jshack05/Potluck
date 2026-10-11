import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Label, money } from "@/design/system";
import type { Card } from "./types";
import { cardAppearances } from "./card-appearance-catalog";
export const cardLooks = Object.fromEntries(
  Object.values(cardAppearances).map((look) => [look.id, look.label]),
) as Record<Card["design"], string>;
export function CardPreview({
  name,
  design = "aurora",
  closed = false,
  role = "host",
  availableMinor = null,
  compact = false,
  variant = "preview",
  onEdit,
}: {
  name: string;
  closed?: boolean;
  design?: Card["design"];
  role?: "host" | "trusted_spender" | null;
  availableMinor?: number | null;
  compact?: boolean;
  variant?: "preview" | "detail";
  onEdit?: () => void;
}) {
  const targetWidth = compact ? 176 : variant === "detail" ? 369.6 : 330;
  const [width, setWidth] = useState(targetWidth);
  const scale = width / 330;
  // Unknown future IDs keep a neutral preview; never rewrite the saved choice.
  const look = cardAppearances[design];
  const foreground = look?.foreground ?? "#FFFFFF";
  return (
    <View
      onLayout={({ nativeEvent }) => setWidth(nativeEvent.layout.width)}
      style={{
        width: variant === "detail" ? "95%" : "100%",
        maxWidth: targetWidth,
        alignSelf: "center",
        aspectRatio: 330 / 176,
        borderRadius: 22 * scale,
        backgroundColor: look?.background ?? "#263433",
        overflow: "hidden",
      }}
    >
      {look?.image && (
        <Image
          source={look.image}
          contentFit="cover"
          style={StyleSheet.absoluteFill}
        />
      )}
      {look?.panel && (
        <View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "50%",
            right: 0,
            borderRadius: 22 * scale,
            backgroundColor: look.panel,
          }}
        />
      )}
      {/* Keep the artwork in the unpadded outer bounds on iOS and Android.
          Text uses the source card's 330 × 176 coordinate system. */}
      <View
        style={{
          position: "absolute",
          top: 28 * scale,
          left: 22 * scale,
          right: 22 * scale,
        }}
      >
        <Label
          numberOfLines={1}
          style={{
            color: foreground,
            fontFamily: "Inter_700Bold",
            fontSize: 20 * scale,
            lineHeight: 26 * scale,
            maxWidth: role && !compact ? "72%" : "100%",
          }}
        >
          {name || "Your card"}
        </Label>
      </View>
      {!compact && role && (
        <View
          style={{
            position: "absolute",
            top: 18 * scale,
            right: 22 * scale,
            borderWidth: 1,
            borderColor: foreground + "4D",
            backgroundColor: foreground + "24",
            borderRadius: 9 * scale,
            paddingHorizontal: 8 * scale,
          }}
        >
          <Label
            style={{
              color: foreground,
              fontSize: 9 * scale,
              lineHeight: 16 * scale,
            }}
          >
            {role === "host" ? "HOST" : "TRUSTED SPENDER"}
          </Label>
        </View>
      )}
      <View
        style={{
          position: "absolute",
          top: 76 * scale,
          left: 22 * scale,
          right: 22 * scale,
          gap: 5 * scale,
        }}
      >
        {availableMinor !== null && !closed && (
          <Label
            style={{
              color: foreground,
              fontSize: 12 * scale,
              lineHeight: 16 * scale,
            }}
          >
            Available to spend
          </Label>
        )}
        <Label
          style={{
            color: foreground,
            fontFamily: "Inter_700Bold",
            fontSize: (availableMinor !== null ? 28 : 18) * scale,
            lineHeight: 32 * scale,
          }}
        >
          {closed
            ? "Setup closed"
            : availableMinor !== null
              ? money(availableMinor)
              : "Setup required"}
        </Label>
        {availableMinor === null && (
          <Label
            style={{
              color: foreground,
              fontSize: 12 * scale,
              lineHeight: 18 * scale,
            }}
          >
            {compact ? "Not issued" : "Not issued · no spending available"}
          </Label>
        )}
      </View>
      {onEdit && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit card"
          onPress={(event) => {
            event.stopPropagation();
            onEdit();
          }}
          style={{
            position: "absolute",
            right: 16,
            bottom: 16,
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={require("../../../assets/potluck/card-flow/edit.svg")}
            style={{ width: 26, height: 26 }}
            contentFit="contain"
          />
        </Pressable>
      )}
    </View>
  );
}
