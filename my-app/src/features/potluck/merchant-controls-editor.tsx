import { useEffect, useReducer, useRef, useState } from "react";
import { router, useNavigation } from "expo-router";
import { usePreventRemove } from "expo-router/react-navigation";
import type { MerchantControlsState } from "@potluck/contracts";
import { Action, ErrorText, Shell } from "@/design/system";
import { useAction, useCommand, type User } from "@/services/client";
import type { Card } from "./types";
import {
  createMerchantEditor,
  merchantEditorReducer,
  merchantSettings,
  type MerchantEdit,
  type MerchantErrors,
} from "./merchant-controls-model";
import {
  MerchantControlsForm,
  MerchantIndustryPicker,
} from "./merchant-controls-form";

/** Draft lifetime is one user and Card. Only Save commits through the API. */
export function MerchantControlsEditor({
  card,
  user,
  saved,
}: {
  card: Card;
  user: User;
  saved: MerchantControlsState;
}) {
  const [state, dispatch] = useReducer(
    merchantEditorReducer,
    saved,
    createMerchantEditor,
  );
  const [errors, setErrors] = useState<MerchantErrors>({});
  const act = useAction(),
    command = useCommand(),
    navigation = useNavigation();
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const picking = state.picker !== null;
  const leave = () => router.dismissTo(`/card/${card.id}/setup`);
  usePreventRemove(picking, ({ data }) => {
    if (data.action.type === "GO_BACK" || data.action.type === "POP")
      dispatch({ type: "cancel-industries" });
    else navigation.dispatch(data.action);
  });
  const change = (action: MerchantEdit) => {
    if (act.busy) return;
    dispatch(action);
    setErrors({});
    act.setError("");
  };
  const save = () => {
    const parsed = merchantSettings(state.draft);
    if (!parsed.ok) {
      setErrors(parsed.errors);
      return;
    }
    return act.run(async () => {
      await command<MerchantControlsState>(
        `/cards/${card.id}/merchant-controls`,
        { expectedVersion: state.version, settings: parsed.settings },
      );
      if (alive.current) leave();
    });
  };
  return (
    <Shell
      title={picking ? "Choose industries" : "Merchant controls"}
      subtitle={
        picking
          ? "Only checked industries will be allowed."
          : "Choose where this card can be used."
      }
      headerTitleSize={28}
      back
      active="Cards"
      keyboardContentOnly
      onBack={picking ? () => change({ type: "cancel-industries" }) : leave}
      footer={
        <>
          <ErrorText text={act.error} />
          <Action
            label={
              picking
                ? `Use ${state.picker!.length} ${state.picker!.length === 1 ? "industry" : "industries"}`
                : "Save controls"
            }
            disabled={act.busy}
            onPress={picking ? () => change({ type: "use-industries" }) : save}
          />
        </>
      }
    >
      {picking ? (
        <MerchantIndustryPicker
          selected={state.picker!}
          onToggle={(industry) => change({ type: "toggle-industry", industry })}
        />
      ) : (
        <MerchantControlsForm
          card={card}
          fullName={user.name}
          draft={state.draft}
          errors={errors}
          disabled={act.busy}
          onChange={change}
        />
      )}
    </Shell>
  );
}
