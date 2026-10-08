import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Label, money } from "@/design/system";
import type { Card } from "./types";
export const cardLooks: Record<Card["design"], string> = {
  aurora: "Northern lights",
  graphite: "Graphite",
  teal: "Evergreen",
  aurora_gradient: "Aurora gradient",
  sunset: "Sunset gradient",
  coral: "Coral",
  ocean: "Ocean",
  berry: "Violet",
};

// Native equivalent of the editable gradient fill in Figma 928:4751.
function gradient(colors: string[]) {
  return {
    uri:
      "data:image/svg+xml," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="330" height="176" viewBox="0 0 330 176"><defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="19.21" y1="-24.56" x2="310.79" y2="200.56"><stop offset="6.6667%" stop-color="${colors[0]}"/><stop offset="48.333%" stop-color="${colors[1]}"/><stop offset="90%" stop-color="${colors[2]}"/></linearGradient></defs><rect width="330" height="176" fill="url(#g)"/></svg>`,
      ),
  };
}
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
  return (
    <View
      onLayout={({ nativeEvent }) => setWidth(nativeEvent.layout.width)}
      style={{
        width: variant === "detail" ? "95%" : "100%",
        maxWidth: targetWidth,
        alignSelf: "center",
        aspectRatio: 330 / 176,
        borderRadius: 22 * scale,
        backgroundColor:
          design === "teal"
            ? "#006D67"
            : design === "coral"
              ? "#F36F55"
              : design === "ocean"
                ? "#1C3F98"
                : design === "berry"
                  ? "#5B21A6"
                  : "#263433",
        overflow: "hidden",
      }}
    >
      {(
        ["aurora", "graphite", "aurora_gradient", "sunset"] as string[]
      ).includes(design) && (
        <Image
          source={
            design === "aurora_gradient"
              ? gradient(["#006D67", "#2663CB", "#8E52B6"])
              : design === "sunset"
                ? gradient(["#F76F55", "#E0418F", "#5A3CAE"])
                : design === "graphite"
                  ? require("../../../assets/potluck/card-graphite.png")
                  : require("../../../assets/potluck/card-aurora.png")
          }
          contentFit="cover"
          style={StyleSheet.absoluteFill}
        />
      )}
      {(["aurora_gradient", "sunset", "ocean", "berry"] as string[]).includes(
        design,
      ) && (
        <View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "50%",
            right: 0,
            borderRadius: 22 * scale,
            backgroundColor:
              design === "ocean"
                ? "rgba(12,166,154,0.52)"
                : design === "berry"
                  ? "rgba(243,111,85,0.52)"
                  : "rgba(255,255,255,0.22)",
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
            color: "white",
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
            borderColor: "#FFFFFF4D",
            backgroundColor: "#FFFFFF24",
            borderRadius: 9 * scale,
            paddingHorizontal: 8 * scale,
          }}
        >
          <Label
            style={{
              color: "white",
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
              color: "white",
              fontSize: 12 * scale,
              lineHeight: 16 * scale,
            }}
          >
            Available to spend
          </Label>
        )}
        <Label
          style={{
            color: "white",
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
              color: "white",
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
