import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  PanResponder,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useReducedMotion } from "./loading";
import { sheetGeometry, sheetRelease } from "./sheet-geometry";

export type SheetDrag = {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  scrollOffset: RefObject<number>;
};

/** The native modal does not translate: only its foreground sheet moves. */
export function SheetSurface({
  visible,
  onClose,
  height,
  children,
  drag,
}: {
  visible: boolean;
  onClose: () => void;
  height?: number;
  children: ReactNode;
  drag?: SheetDrag;
}) {
  const { height: viewport } = useWindowDimensions();
  const inset = useSafeAreaInsets();
  const [keyboard, setKeyboard] = useState(
    () => Keyboard.metrics?.()?.height ?? 0,
  );
  const geometry = sheetGeometry(viewport, inset.top, inset.bottom, keyboard);
  const targetHeight = drag?.expanded ? geometry.expanded : geometry.compact;
  const [sheetHeight] = useState(() => new Animated.Value(targetHeight));
  const [sheetBottom] = useState(() => new Animated.Value(geometry.bottom));
  const [dragOffset] = useState(() => new Animated.Value(0));
  const currentHeight = useRef(targetHeight),
    startHeight = useRef(targetHeight),
    touchStart = useRef(0);
  const reduced = useReducedMotion();
  const [present, setPresent] = useState(visible);
  const [offset] = useState(() => new Animated.Value(viewport));
  const dragEnabled = !!drag;
  useEffect(() => {
    if (!dragEnabled) return;
    const show = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillChangeFrame" : "keyboardDidShow",
      (event) => {
        setKeyboard(Math.max(0, viewport - event.endCoordinates.screenY));
      },
    );
    const hide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboard(0),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, [dragEnabled, viewport]);
  useEffect(() => {
    const id = sheetHeight.addListener(({ value }) => {
      currentHeight.current = value;
    });
    return () => sheetHeight.removeListener(id);
  }, [sheetHeight]);
  useEffect(() => {
    if (!dragEnabled || !visible) return;
    dragOffset.setValue(0);
    const motion = Animated.parallel([
      Animated.timing(sheetHeight, {
        toValue: targetHeight,
        duration: reduced ? 0 : 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(sheetBottom, {
        toValue: geometry.bottom,
        duration: reduced ? 0 : 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]);
    motion.start();
    return () => motion.stop();
  }, [
    targetHeight,
    geometry.bottom,
    dragEnabled,
    reduced,
    sheetHeight,
    sheetBottom,
    visible,
    dragOffset,
  ]);
  const latest = useRef({
    drag,
    geometry,
    onClose,
    targetHeight,
    reduced,
    viewport,
  });
  useLayoutEffect(() => {
    latest.current = {
      drag,
      geometry,
      onClose,
      targetHeight,
      reduced,
      viewport,
    };
  });
  // PanResponder registers these event callbacks; it does not read their refs during render.
  // eslint-disable-next-line react-hooks/refs
  const [pan] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponderCapture: (event) => {
        touchStart.current = event.nativeEvent.pageY;
        const {
          drag: active,
          geometry: bounds,
          viewport: screen,
        } = latest.current;
        const top = screen - bounds.bottom - currentHeight.current;
        return (
          !!active && touchStart.current >= top && touchStart.current < top + 48
        );
      },
      onMoveShouldSetPanResponderCapture: (_event, g) => {
        const {
          drag: active,
          geometry: bounds,
          viewport: screen,
        } = latest.current;
        return (
          !!active &&
          Math.abs(g.dy) > 6 &&
          Math.abs(g.dy) > Math.abs(g.dx) &&
          (touchStart.current <
            screen - bounds.bottom - currentHeight.current + 48 ||
            (!active.expanded && g.dy < 0) ||
            (g.dy > 0 && active.scrollOffset.current <= 0))
        );
      },
      onPanResponderGrant: () => {
        sheetHeight.stopAnimation();
        startHeight.current = currentHeight.current;
      },
      onPanResponderMove: (_event, g) => {
        const bounds = latest.current.geometry;
        const proposed = startHeight.current - g.dy;
        sheetHeight.setValue(
          Math.max(bounds.compact, Math.min(bounds.expanded, proposed)),
        );
        // Below the compact stop, move the intact surface toward dismissal.
        dragOffset.setValue(Math.max(0, bounds.compact - proposed));
      },
      onPanResponderRelease: (_event, g) => {
        const {
          drag: active,
          geometry: bounds,
          onClose: close,
          reduced: immediate,
        } = latest.current;
        if (Math.abs(g.dy) < 6 && Math.abs(g.dx ?? 0) < 6) {
          active?.onExpandedChange(!active.expanded);
          return;
        }
        const next = sheetRelease(
          startHeight.current - g.dy,
          g.vy,
          bounds.compact,
          bounds.expanded,
        );
        if (next === "closed") {
          Keyboard.dismiss();
          close();
          return;
        }
        active?.onExpandedChange(next === "expanded");
        Animated.timing(dragOffset, {
          toValue: 0,
          duration: immediate ? 0 : 180,
          useNativeDriver: true,
        }).start();
        Animated.timing(sheetHeight, {
          toValue: next === "expanded" ? bounds.expanded : bounds.compact,
          duration: immediate ? 0 : 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }).start();
      },
      onPanResponderTerminate: () => {
        Animated.timing(dragOffset, {
          toValue: 0,
          duration: latest.current.reduced ? 0 : 180,
          useNativeDriver: true,
        }).start();
        Animated.timing(sheetHeight, {
          toValue: latest.current.targetHeight,
          duration: latest.current.reduced ? 0 : 180,
          useNativeDriver: false,
        }).start();
      },
    }),
  );
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
          onPress={() => {
            if (drag) Keyboard.dismiss();
            onClose();
          }}
          style={[StyleSheet.absoluteFill, { backgroundColor: "#0000002E" }]}
        />
        <KeyboardAvoidingView
          enabled={!drag}
          pointerEvents="box-none"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{
            flex: 1,
            justifyContent: "flex-end",
            padding: 20,
            paddingBottom: drag ? 0 : 32,
          }}
        >
          <Animated.View
            pointerEvents="box-none"
            style={{
              width: "100%",
              maxWidth: 430,
              alignSelf: "center",
              transform: [{ translateY: offset }, { translateY: dragOffset }],
            }}
          >
            {/* Keep JS layout on a different animated style node from native transforms. */}
            <Animated.View
              accessibilityViewIsModal
              {...(drag ? pan.panHandlers : {})}
              style={{
                backgroundColor: "white",
                borderRadius: 32,
                width: "100%",
                maxWidth: 430,
                alignSelf: "center",
                maxHeight: drag ? undefined : "85%",
                height: drag ? sheetHeight : height,
                marginBottom: drag ? sheetBottom : 0,
                overflow: drag ? "hidden" : undefined,
                padding: 20,
                gap: 12,
              }}
            >
              {/* Pointer gestures belong to the sheet; the child also supports keyboard/accessibility activation. */}
              {drag && (
                <View
                  pointerEvents="box-only"
                  style={{ alignItems: "center", paddingVertical: 2 }}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      drag.expanded ? "Collapse people" : "Expand people"
                    }
                    onPress={() => drag.onExpandedChange(!drag.expanded)}
                    hitSlop={12}
                    style={{
                      width: 58,
                      height: 5,
                      borderRadius: 3,
                      backgroundColor: "#D8E2DE",
                    }}
                  />
                </View>
              )}
              {children}
            </Animated.View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
