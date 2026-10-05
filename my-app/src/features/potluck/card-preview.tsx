import { Image } from "expo-image";
import { View } from "react-native";
import { Label } from "@/design/system";
export function CardPreview({
  name,
  design = "aurora",
  closed = false,
}: {
  name: string;
  closed?: boolean;
  design?: "teal" | "graphite" | "aurora";
}) {
  return (
    <View
      style={{
        width: "100%",
        maxWidth: 330,
        alignSelf: "center",
        height: 176,
        borderRadius: 22,
        backgroundColor: design === "teal" ? "#006D67" : "#263433",
        overflow: "hidden",
        padding: 22,
        justifyContent: "space-between",
      }}
    >
      {design !== "teal" && (
        <Image
          source={
            design === "graphite"
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
      <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
        <Label
          style={{
            color: "white",
            fontFamily: "Inter_700Bold",
            fontSize: 21,
            flex: 1,
          }}
        >
          {name || "Your card"}
        </Label>
        <View
          style={{
            borderWidth: 1,
            borderColor: "#FFFFFF88",
            borderRadius: 12,
            paddingHorizontal: 10,
          }}
        >
          <Label style={{ color: "white", fontSize: 10 }}>Host</Label>
        </View>
      </View>
      <View style={{ gap: 5 }}>
        <Label
          style={{
            color: "white",
            fontFamily: "Inter_600SemiBold",
            fontSize: 18,
          }}
        >
          {closed ? "Setup closed" : "Setup required"}
        </Label>
        <Label style={{ color: "white", fontSize: 12 }}>
          Not issued · no spending available
        </Label>
      </View>
    </View>
  );
}
