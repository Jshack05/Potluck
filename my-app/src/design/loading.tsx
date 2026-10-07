import { useEffect, useState } from "react";
import { theme } from "./primitives";
import {
  AccessibilityInfo,
  Animated,
  View,
  StyleSheet,
  type DimensionValue,
} from "react-native";

export function useReducedMotion() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(
      (value) => {
        if (active) setReduced(value);
      },
      () => {
        if (active) setReduced(true);
      },
    );
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced,
    );
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
  return reduced;
}
export type SkeletonVariant =
  | "details"
  | "circles"
  | "cards"
  | "bills"
  | "summary"
  | "summary-content"
  | "people"
  | "messages"
  | "listings";
function Bone({
  width = "100%",
  height = 14,
  round = 7,
}: {
  width?: DimensionValue;
  height?: number;
  round?: number;
}) {
  return (
    <View
      style={{
        width,
        height,
        borderRadius: round,
        backgroundColor: theme.skeleton,
      }}
    />
  );
}
function Rows({ count, people = false }: { count: number; people?: boolean }) {
  return (
    <View style={{ gap: 24 }}>
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={s.row}>
          <Bone
            width={people ? 44 : 40}
            height={people ? 44 : 40}
            round={people ? 22 : 12}
          />
          <View style={{ flex: 1, gap: 10 }}>
            <Bone width="64%" />
            <Bone width="42%" height={10} />
          </View>
        </View>
      ))}
    </View>
  );
}
function Summary() {
  return (
    <View style={s.summary}>
      <View style={s.row}>
        <Bone width="45%" />
        <Bone width="35%" />
      </View>
      <Bone width="46%" height={12} />
      <Bone width="58%" height={40} />
      <View style={s.divider} />
      <Rows count={1} />
    </View>
  );
}

/** Non-interactive placeholders; no invented identities, amounts or financial states. */
export function ScreenSkeleton({
  variant = "details",
}: {
  variant?: SkeletonVariant;
}) {
  const reduced = useReducedMotion();
  const [opacity] = useState(() => new Animated.Value(1));
  useEffect(() => {
    if (reduced) {
      opacity.setValue(1);
      return;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.55,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => {
      pulse.stop();
      opacity.setValue(1);
    };
  }, [opacity, reduced]);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Loading content"
      accessibilityState={{ busy: true }}
      accessibilityLiveRegion="polite"
      testID={`skeleton-${variant}`}
    >
      <Animated.View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{ opacity, gap: 24, paddingVertical: 16 }}
      >
        {variant === "cards" ? (
          <>
            <Bone height={214} round={24} />
            <Bone height={74} round={24} />
          </>
        ) : variant === "summary" ? (
          <Summary />
        ) : variant === "summary-content" ? (
          <>
            <Bone width="58%" height={40} />
            <Rows count={1} />
          </>
        ) : variant === "bills" ? (
          <>
            <Summary />
            <Rows count={3} />
          </>
        ) : variant === "circles" ? (
          <>
            <Rows count={2} people />
            <View style={s.row}>
              {[0, 1, 2].map((i) => (
                <Bone key={i} width={26} height={26} round={13} />
              ))}
            </View>
          </>
        ) : variant === "people" || variant === "messages" ? (
          <Rows count={3} people />
        ) : variant === "listings" ? (
          <>
            {[0, 1].map((i) => (
              <View key={i} style={{ gap: 16 }}>
                <Rows count={1} people />
                <Bone width="72%" height={24} />
                <Bone width="42%" height={22} />
                <View style={s.divider} />
              </View>
            ))}
          </>
        ) : (
          <>
            <Bone width="62%" height={26} />
            <Rows count={2} />
            <Bone width="80%" />
            <Bone width="55%" />
          </>
        )}
      </Animated.View>
    </View>
  );
}
const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 16, alignItems: "center" },
  summary: {
    minHeight: 248,
    borderRadius: 24,
    padding: 18,
    backgroundColor: "white",
    gap: 22,
  },
  divider: { height: 1, backgroundColor: "#E3EAE7" },
});
