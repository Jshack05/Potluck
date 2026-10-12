import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import { cardAppearances } from "./card-appearance-catalog";
import type { Card } from "./types";

/** Shared edge-to-edge artwork; callers own size, clipping and identity content. */
export function CardArtwork({
  design,
  radius,
}: {
  design: Card["design"];
  radius: number;
}) {
  const look = cardAppearances[design];
  return (
    <>
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
            borderRadius: radius,
            backgroundColor: look.panel,
          }}
        />
      )}
    </>
  );
}
