import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Label, theme, go } from "@/design/system";
import { creationPath } from "@/services/navigation";

const options = [
  {
    title: "New Circle",
    detail: "Start a shared group of people.",
    path: "/create/circle",
    color: "#F1FAF6",
    asset: require("../../../assets/potluck/create-circle.svg"),
    width: 24,
    height: 20.471,
  },
  {
    title: "New Card",
    detail: "Set up a card for shared expenses.",
    path: "/create/card",
    color: "#FAF5FC",
    asset: require("../../../assets/potluck/create-card.svg"),
    width: 23.5,
    height: 17.5,
  },
  {
    title: "New Bill",
    detail: "Set up a shared bill and review splits.",
    path: "/create/bill",
    color: "#FFF8E7",
    asset: require("../../../assets/potluck/create-bill.svg"),
    width: 19.5,
    height: 22.855,
  },
  {
    title: "New Goal",
    detail: "Save toward a target or time-based goal.",
    path: "/create/goal",
    color: "#F0FAFA",
    asset: require("../../../assets/potluck/target.svg"),
    width: 24,
    height: 24,
  },
] as const;

/** Figma 199:317 / source component 185:198. Selection starts a flow only. */
export function CreationMenu({ circleId }: { circleId?: string }) {
  const [open, setOpen] = useState(false);
  const inset = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const bottom = height < 600 ? 24 : Math.max(inset.bottom, 16) + 112;
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create something new"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        style={({ pressed }) => ({
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: theme.teal,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Label
          style={{
            color: "white",
            fontSize: 42,
            lineHeight: 46,
            fontFamily: "Inter_400Regular",
          }}
        >
          +
        </Label>
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.18)",
            justifyContent: "flex-end",
            alignItems: "center",
            padding: 20,
            paddingBottom: bottom,
          }}
        >
          <Pressable
            accessible={false}
            aria-hidden
            onPress={() => setOpen(false)}
            style={{ position: "absolute", inset: 0 }}
          />
          <View
            accessibilityViewIsModal
            style={{
              width: "100%",
              maxWidth: 390,
              maxHeight: height - bottom - 40,
              borderRadius: 28,
              backgroundColor: "white",
              padding: 16,
              paddingTop: 22,
              gap: 12,
              boxShadow: "0px 10px 30px -8px rgba(0,0,0,.1)",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Label
                accessibilityRole="header"
                style={{
                  fontSize: 20,
                  lineHeight: 27,
                  fontFamily: "Inter_700Bold",
                  marginHorizontal: 8,
                  flex: 1,
                }}
              >
                Create something new
              </Label>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close creation menu"
                onPress={() => setOpen(false)}
                style={{
                  width: 44,
                  height: 44,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Label style={{ fontSize: 26, color: theme.muted }}>×</Label>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ gap: 12 }}>
              {options.map((option) => (
                <Pressable
                  key={option.path}
                  accessibilityRole="button"
                  accessibilityLabel={option.title}
                  onPress={() => {
                    setOpen(false);
                    go(
                      creationPath(
                        option.path,
                        option.path === "/create/circle" ? {} : { circleId },
                      ),
                    );
                  }}
                  style={({ pressed }) => ({
                    minHeight: 54,
                    borderRadius: 20,
                    backgroundColor: option.color,
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    gap: 20,
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  <View style={{ width: 24, alignItems: "center" }}>
                    <Image
                      source={option.asset}
                      contentFit="contain"
                      style={{ width: option.width, height: option.height }}
                    />
                  </View>
                  <View style={{ flex: 1, paddingVertical: 6 }}>
                    <Label
                      style={{
                        fontFamily: "Inter_700Bold",
                        fontSize: 15,
                        lineHeight: 20,
                      }}
                    >
                      {option.title}
                    </Label>
                    <Label
                      style={{
                        color: theme.muted,
                        fontSize: 12,
                        lineHeight: 16,
                      }}
                    >
                      {option.detail}
                    </Label>
                  </View>
                  <Label style={{ color: theme.teal, fontSize: 26 }}>›</Label>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
