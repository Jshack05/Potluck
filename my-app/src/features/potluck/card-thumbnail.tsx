import { View } from "react-native";
import { Label } from "@/design/primitives";
import { CardArtwork } from "./card-artwork";
import { cardAppearances } from "./card-appearance-catalog";
import type { Card } from "./types";

/** Figma 2370:48104 / 2378:48103: original artwork, only the user's full name. */
export function CardThumbnail({
  design,
  fullName,
}: {
  design: Card["design"];
  fullName: string;
}) {
  const look = cardAppearances[design],
    radius = (104 * 22) / 330;
  return (
    <View
      accessible
      accessibilityLabel={fullName}
      style={{
        width: 104,
        aspectRatio: 330 / 176,
        borderRadius: radius,
        overflow: "hidden",
        backgroundColor: look?.background ?? "#263433",
        padding: 8,
      }}
    >
      <CardArtwork design={design} radius={radius} />
      <Label
        numberOfLines={3}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        style={{
          fontFamily: "Inter_700Bold",
          fontSize: 10,
          lineHeight: 12,
          color: look?.foreground ?? "#FFFFFF",
        }}
      >
        {fullName}
      </Label>
    </View>
  );
}
