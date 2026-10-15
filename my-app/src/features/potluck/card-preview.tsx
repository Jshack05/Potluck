import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Label, money } from "@/design/system";
import type { Card } from "./types";
import { cardAppearances } from "./card-appearance-catalog";
import { CardArtwork } from "./card-artwork";
export type CardCreationIdentity = {
  fullName: string;
  role: "host" | "contributor";
};
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
  creationIdentity,
  identityStyle = "creation",
  onEdit,
  onOpenBalance,
}: {
  name: string;
  closed?: boolean;
  design?: Card["design"];
  role?: "host" | "trusted_spender" | null;
  availableMinor?: number | null;
  compact?: boolean;
  variant?: "preview" | "detail";
  creationIdentity?: CardCreationIdentity;
  identityStyle?: "creation" | "edit";
  onEdit?: () => void;
  onOpenBalance?: () => void;
}) {
  const targetWidth = compact ? 176 : variant === "detail" ? 369.6 : 330;
  const [width, setWidth] = useState(targetWidth);
  const scale = width / 330;
  // Unknown future IDs keep a neutral preview; never rewrite the saved choice.
  const look = cardAppearances[design];
  const foreground = look?.foreground ?? "#FFFFFF";
  const displayedRole = creationIdentity?.role ?? role;
  const roleLabel =
    displayedRole === "host"
      ? "HOST"
      : displayedRole === "contributor"
        ? "CONTRIBUTOR"
        : "TRUSTED SPENDER";
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
      <CardArtwork design={design} radius={22 * scale} />
      {/* Keep the artwork in the unpadded outer bounds on iOS and Android.
          Text uses the source card's 330 × 176 coordinate system. */}
      <View
        style={{
          position: "absolute",
          top: (identityStyle === "edit" ? 20 : 28) * scale,
          left: 22 * scale,
          right: 22 * scale,
        }}
      >
        <Label
          numberOfLines={1}
          style={{
            color: foreground,
            fontFamily: "Inter_700Bold",
            fontSize: (identityStyle === "edit" ? 18 : 20) * scale,
            lineHeight: 26 * scale,
            maxWidth: displayedRole && !compact ? "72%" : "100%",
          }}
        >
          {name || "Your card"}
        </Label>
      </View>
      {!compact && displayedRole && (
        <View
          style={{
            position: "absolute",
            top: 18 * scale,
            right: 22 * scale,
            borderWidth: 1,
            borderColor: foreground + "4D",
            backgroundColor:
              identityStyle === "edit" ? "white" : foreground + "24",
            borderRadius: 9 * scale,
            paddingHorizontal: 8 * scale,
          }}
        >
          <Label
            style={{
              color: identityStyle === "edit" ? "#273432" : foreground,
              fontSize: 9 * scale,
              lineHeight: 16 * scale,
            }}
          >
            {roleLabel}
          </Label>
        </View>
      )}
      {creationIdentity ? (
        (!compact || identityStyle !== "edit") && (
          <View
            style={{
              position: "absolute",
              bottom: (identityStyle === "edit" ? 58 : 22) * scale,
              left: 22 * scale,
              right: 22 * scale,
            }}
          >
            <Label
              numberOfLines={3}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={{
                color: foreground,
                fontSize: 14 * scale,
                fontFamily:
                  identityStyle === "edit" ? "Inter_700Bold" : undefined,
                lineHeight: 18 * scale,
              }}
            >
              {creationIdentity.fullName}
            </Label>
          </View>
        )
      ) : (
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
      )}
      {!creationIdentity && onOpenBalance && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Balance details"
          onPress={onOpenBalance}
          style={StyleSheet.absoluteFill}
        />
      )}
      {!creationIdentity && onEdit && (
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
            tintColor={foreground}
            style={{ width: 26, height: 26 }}
            contentFit="contain"
          />
        </Pressable>
      )}
    </View>
  );
}
