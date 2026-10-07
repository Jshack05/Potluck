import { useEffect, useState, type ReactNode } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useReducedMotion } from "./loading";

/** The native modal does not translate: only its foreground sheet moves. */
export function SheetSurface({
  visible,
  onClose,
  height,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  height?: number;
  children: ReactNode;
}) {
  const { height: viewport } = useWindowDimensions();
  const reduced = useReducedMotion();
  const [present, setPresent] = useState(visible);
  const [offset] = useState(() => new Animated.Value(viewport));
  if (visible && !present) setPresent(true);
  useEffect(() => {
    let current = true;
    const animation = Animated.timing(offset, {
      toValue: visible ? 0 : viewport,
      duration: reduced ? 0 : visible ? 240 : 180,
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (current && finished && !visible) setPresent(false);
    });
    return () => {
      current = false;
      animation.stop();
    };
  }, [visible, reduced, viewport, offset]);
  return (
    <Modal
      visible={visible || present}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close popup"
          onPress={onClose}
          style={[StyleSheet.absoluteFill, { backgroundColor: "#0000002E" }]}
        />
        <KeyboardAvoidingView
          pointerEvents="box-none"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{
            flex: 1,
            justifyContent: "flex-end",
            padding: 20,
            paddingBottom: 32,
          }}
        >
          <Animated.View
            accessibilityViewIsModal
            style={{
              backgroundColor: "white",
              borderRadius: 32,
              width: "100%",
              maxWidth: 430,
              alignSelf: "center",
              maxHeight: "85%",
              height,
              padding: 20,
              gap: 12,
              transform: [{ translateY: offset }],
            }}
          >
            {children}
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
