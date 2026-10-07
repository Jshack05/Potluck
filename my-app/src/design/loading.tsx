import { useEffect, useState } from "react";
import { AccessibilityInfo, ActivityIndicator, View } from "react-native";
import { Label, theme } from "./primitives";
import { scheduleLoadingFeedback } from "./loading-delay";

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

/** A blank first paint; a small status appears only if this request takes longer. */
export function LoadingFeedback({ label = "Loading…" }: { label?: string }) {
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => scheduleLoadingFeedback(() => setVisible(true)), []);
  if (!visible) return null;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
      accessibilityLiveRegion="polite"
      testID="loading-feedback"
      style={{
        minHeight: 48,
        paddingVertical: 14,
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {!reduced && (
        <ActivityIndicator accessible={false} size="small" color={theme.teal} />
      )}
      <Label
        accessible={false}
        style={{ fontSize: 14, lineHeight: 20, color: theme.muted }}
      >
        {label}
      </Label>
    </View>
  );
}
