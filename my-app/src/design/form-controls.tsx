import {
  Switch,
  useWindowDimensions,
  type SwitchProps,
  type TextInputProps,
} from "react-native";
import { Field, theme } from "./system";

/** Figma Toggle Switch 424:650. iOS exposes its background when off/disabled. */
export function Toggle(
  props: Omit<SwitchProps, "trackColor" | "thumbColor" | "ios_backgroundColor">,
) {
  return (
    <Switch
      {...props}
      trackColor={{ true: theme.teal, false: "#D2D9D7" }}
      thumbColor="white"
      ios_backgroundColor="#D2D9D7"
    />
  );
}

/** Large amounts need their own font metrics rather than the 16px Field padding. */
export function AmountField({
  style,
  fontSize = 40,
  ...props
}: TextInputProps & { label: string; error?: string; fontSize?: number }) {
  const { fontScale } = useWindowDimensions();
  const lineHeight = Math.ceil(fontSize * 1.25);
  return (
    <Field
      keyboardType="decimal-pad"
      {...props}
      style={[
        style,
        {
          backgroundColor: "transparent",
          borderWidth: 0,
          paddingHorizontal: 0,
          paddingVertical: 8,
          fontSize,
          lineHeight,
          minHeight: Math.ceil(lineHeight * fontScale) + 16,
          fontFamily: "Inter_700Bold",
          color: theme.teal,
          textAlignVertical: "center",
        },
      ]}
    />
  );
}
