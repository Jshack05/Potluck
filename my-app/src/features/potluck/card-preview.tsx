import { Image } from "expo-image";
import { View } from "react-native";
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
}: {
  name: string;
  closed?: boolean;
  design?: Card["design"];
  role?: "host" | "trusted_spender" | null;
  availableMinor?: number | null;
  compact?: boolean;
}) {
  return (
    <View
      style={{
        width: "100%",
        maxWidth: 330,
        alignSelf: "center",
        height: compact ? 94 : 176,
        borderRadius: compact ? 12 : 22,
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
        padding: compact ? 12 : 22,
        justifyContent: "space-between",
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
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
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
            borderRadius: compact ? 12 : 22,
            backgroundColor:
              design === "ocean"
                ? "rgba(12,166,154,0.52)"
                : design === "berry"
                  ? "rgba(243,111,85,0.52)"
                  : "rgba(255,255,255,0.22)",
          }}
        />
      )}
      <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
        <Label
          numberOfLines={compact ? 1 : 2}
          style={{
            color: "white",
            fontFamily: "Inter_700Bold",
            fontSize: compact ? 11 : 20,
            lineHeight: compact ? 15 : 26,
            flex: 1,
          }}
        >
          {name || "Your card"}
        </Label>
        {!compact && role && (
          <View
            style={{
              borderWidth: 1,
              borderColor: "#FFFFFF88",
              borderRadius: 12,
              paddingHorizontal: 10,
            }}
          >
            <Label style={{ color: "white", fontSize: 9, lineHeight: 16 }}>
              {role === "host" ? "HOST" : "TRUSTED SPENDER"}
            </Label>
          </View>
        )}
      </View>
      <View style={{ gap: 5 }}>
        <Label
          style={{
            color: "white",
            fontFamily: "Inter_600SemiBold",
            fontSize: compact ? 12 : availableMinor !== null ? 28 : 18,
            lineHeight: compact ? 16 : 32,
          }}
        >
          {closed
            ? "Setup closed"
            : availableMinor !== null
              ? money(availableMinor)
              : "Setup required"}
        </Label>
        <Label
          style={{
            color: "white",
            fontSize: compact ? 8 : 12,
            lineHeight: compact ? 12 : 18,
          }}
        >
          {availableMinor !== null
            ? "Available to spend"
            : compact
              ? "Not issued"
              : "Not issued · no spending available"}
        </Label>
      </View>
    </View>
  );
}
