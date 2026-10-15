import { useEffect, useRef, useState } from "react";
import { Keyboard, Pressable, View } from "react-native";
import { router, useNavigation } from "expo-router";
import { usePreventRemove } from "expo-router/react-navigation";
import { Action, ErrorText, Field, Label, Shell, theme } from "@/design/system";
import { useAction, useCommand, type User } from "@/services/client";
import { CardAppearancePicker } from "./card-creation-steps";
import { CardHeading, CardHint } from "./card-ui";
import type { CardAppearanceCategory } from "./card-appearance-catalog";
import type { Card } from "./types";

/** Figma 2448:47287. The route owns this draft; only Save writes metadata. */
export function CardEditor({ card, user }: { card: Card; user: User }) {
  const [name, setName] = useState(card.name);
  const [design, setDesign] = useState(card.design);
  const [version] = useState(card.version);
  const [expanded, setExpanded] = useState<CardAppearanceCategory[]>([]);
  const [saved, setSaved] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const exited = useRef(false);
  const action = useAction(),
    command = useCommand(),
    navigation = useNavigation();
  const valid = name.trim().length > 0 && name.trim().length <= 80;
  const changed = name.trim() !== card.name || design !== card.design;
  const locked = action.busy || saved || leaving;
  usePreventRemove(action.busy || (!saved && !leaving), ({ data }) => {
    if (action.busy) return;
    if (data.action.type === "GO_BACK" || data.action.type === "POP")
      setLeaving(true);
    else navigation.dispatch(data.action);
  });
  useEffect(() => {
    // Wait until the in-flight navigation guard is removed before returning.
    if ((saved || leaving) && !action.busy && !exited.current) {
      exited.current = true;
      router.dismissTo(`/card/${card.id}`);
    }
  }, [saved, leaving, action.busy, card.id]);
  const leave = () => {
    if (!locked) setLeaving(true);
  };
  const save = () => {
    if (!valid || !changed || locked) return;
    Keyboard.dismiss();
    return action.run(async () => {
      await command(`/cards/${card.id}/appearance`, {
        name: name.trim(),
        design,
        expectedVersion: version,
      });
      setSaved(true);
    });
  };
  return (
    <Shell
      title="Edit card"
      back
      headerTitleSize={28}
      active="Cards"
      hideNavigation
      avoidKeyboard={false}
      onBack={leave}
      headerAccessory={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel editing"
          disabled={locked}
          onPress={leave}
          style={{
            minHeight: 44,
            paddingHorizontal: 10,
            borderRadius: 28,
            borderWidth: 1.4,
            borderColor: theme.teal,
            backgroundColor: "white",
            justifyContent: "center",
            opacity: locked ? 0.45 : 1,
          }}
        >
          <Label style={{ color: theme.teal, fontFamily: "Inter_600SemiBold" }}>
            Cancel
          </Label>
        </Pressable>
      }
      footer={
        <>
          <ErrorText text={action.error} />
          <Action
            label={action.busy ? "Saving…" : "Save changes"}
            disabled={locked || !valid || !changed}
            onPress={save}
          />
        </>
      }
    >
      <View style={{ gap: 12 }}>
        <CardHint>Change your card’s name or design.</CardHint>
        <CardHeading>Card name</CardHeading>
        <Field
          label="Card name"
          hideLabel
          value={name}
          editable={!locked}
          maxLength={80}
          onChangeText={(value) => {
            setName(value);
            action.setError("");
          }}
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
          style={{ borderRadius: 28 }}
        />
        <CardHeading>Preview</CardHeading>
        <CardAppearancePicker
          name={name}
          design={design}
          identity={{ fullName: user.name, role: "host" }}
          presentation="edit"
          disabled={locked}
          expandedCategories={expanded}
          onSelect={(value) => {
            if (!locked) {
              setDesign(value);
              action.setError("");
            }
          }}
          onToggleCategory={(category) =>
            setExpanded((current) =>
              current.includes(category)
                ? current.filter((id) => id !== category)
                : [...current, category],
            )
          }
        />
      </View>
    </Shell>
  );
}
