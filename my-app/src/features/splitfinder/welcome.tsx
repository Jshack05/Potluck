import { Image } from "expo-image";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { categoryLabels, type Category } from "./model";
import { usePreview } from "./state";
import { colors, Heading, Txt } from "./ui";

const choices = [
  {
    category: "plans",
    detail: "Phone plans",
    width: 70.95,
    height: 98.9,
  },
  {
    category: "memberships",
    detail: "Passes, fitness & clubs",
    width: 120.4,
    height: 98.9,
  },
  {
    category: "subscriptions",
    detail: "Music, TV & software",
    width: 121.26,
    height: 98.9,
  },
  {
    category: "housing",
    detail: "Roommates & rentals",
    width: 125.56,
    height: 102.34,
  },
] as const;
export default function Welcome() {
  const state = usePreview();
  const { change } = useLocalSearchParams<{ change?: string }>();
  const insets = useSafeAreaInsets();
  if (!state.ready)
    return (
      <View style={[styles.canvas, { justifyContent: "center" }]}>
        <ActivityIndicator accessibilityLabel="Loading your preference" />
      </View>
    );
  if (state.introduced && change !== "1") return <Redirect href="/discover" />;
  function choose(category: Category) {
    state.setCategory(category);
    state.setQuery("");
    state.setMaxMinor(null);
    state.setIntroduced(true);
    if (change === "1" && router.canGoBack()) router.back();
    else router.replace("/discover");
  }
  return (
    <View style={styles.canvas}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, 24) + 32,
            paddingBottom: Math.max(insets.bottom, 24),
          },
        ]}
      >
        <View style={{ paddingHorizontal: 6, gap: 8 }}>
          <Heading style={styles.logo}>Potluck</Heading>
          <Txt style={styles.tagline}>Find people. Split and save.</Txt>
        </View>
        <Heading style={styles.title}>
          Where would you{"\n"}like to save?
        </Heading>
        <View style={styles.grid}>
          {choices.map(({ category, detail, width, height }) => (
            <Pressable
              key={category}
              accessibilityRole="button"
              accessibilityLabel={`${categoryLabels[category]}, ${detail}`}
              onPress={() => choose(category)}
              style={({ pressed }) => [
                styles.tile,
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={styles.artSlot}>
                <CategoryArt
                  category={category}
                  width={width}
                  height={height}
                />
              </View>
              <Txt style={styles.label}>{categoryLabels[category]}</Txt>
              <Txt style={styles.detail}>{detail}</Txt>
            </Pressable>
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => choose("all")}
          style={styles.explore}
        >
          <Txt style={{ color: colors.green, fontWeight: "600" }}>
            Explore all opportunities
          </Txt>
          <Image
            source={require("../../../assets/splitfinder/onboarding-chevron.svg")}
            style={{ width: 16, height: 20 }}
          />
        </Pressable>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  canvas: { flex: 1, backgroundColor: "#F3FBF9" },
  content: {
    width: "100%",
    maxWidth: 478,
    alignSelf: "center",
    paddingHorizontal: 24,
  },
  logo: { fontSize: 40, lineHeight: 48, color: colors.green },
  tagline: { fontSize: 18, lineHeight: 24, color: "#586D80" },
  title: {
    textAlign: "center",
    fontSize: 36,
    lineHeight: 43,
    color: "#172B3D",
    marginTop: 38,
    marginBottom: 33,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", columnGap: 12, rowGap: 14 },
  tile: {
    width: "47%",
    flexGrow: 1,
    minHeight: 210,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#D7EEEA",
    borderRadius: 20,
    paddingHorizontal: 5,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  artSlot: { height: 103, justifyContent: "center", alignItems: "center" },
  label: { fontSize: 19, lineHeight: 24, fontWeight: "700", color: "#172B3D" },
  detail: {
    fontSize: 12,
    lineHeight: 16,
    color: "#586D80",
    textAlign: "center",
  },
  explore: {
    minHeight: 44,
    marginTop: 34,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});

function CategoryArt({
  category,
  width,
  height,
}: {
  category: Category;
  width: number;
  height: number;
}) {
  if (category === "plans" || category === "housing")
    return (
      <Image
        source={
          category === "plans"
            ? require("../../../assets/splitfinder/onboarding-phone.svg")
            : require("../../../assets/splitfinder/onboarding-house.svg")
        }
        style={{ width, height }}
        contentFit="contain"
      />
    );
  return (
    <View style={{ width, height }}>
      {category === "memberships" ? (
        <>
          <Image
            source={require("../../../assets/splitfinder/membership-gym.svg")}
            style={{
              position: "absolute",
              left: 9.85,
              top: 7.35,
              width: 62.1678,
              height: 77.0345,
              transform: [{ rotate: "-13.94deg" }],
            }}
          />
          <Image
            source={require("../../../assets/splitfinder/membership-shop.svg")}
            style={{
              position: "absolute",
              left: 49.6,
              top: 16.05,
              width: 64.1987,
              height: 76.9944,
              transform: [{ rotate: "7.97deg" }],
            }}
          />
        </>
      ) : (
        <>
          <Image
            source={require("../../../assets/splitfinder/subscription-note.svg")}
            style={{
              position: "absolute",
              left: 82.4,
              top: 4.2,
              width: 38.3226,
              height: 42.7154,
              transform: [{ rotate: "-4.98deg" }],
            }}
          />
          <Image
            source={require("../../../assets/splitfinder/subscription-play.svg")}
            style={{
              position: "absolute",
              left: -8,
              top: 31,
              width: 88,
              height: 65,
            }}
          />
          <Image
            source={require("../../../assets/splitfinder/subscription-triangle.svg")}
            style={{
              position: "absolute",
              left: 26,
              top: 49.75,
              width: 24.5526,
              height: 29.8365,
            }}
          />
        </>
      )}
    </View>
  );
}
