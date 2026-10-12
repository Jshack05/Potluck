import { Pressable, View } from "react-native";
import { Label, theme } from "@/design/system";
import { CardHeading, CardHint, CardSelection } from "./card-ui";

export type BetaBankAccount = {
  id: string;
  name: string;
  last4: string;
  state: "simulated";
};
export const betaBankNotice =
  "Beta · Simulated accounts only. No bank login or money movement.";

/** Figma 2326:45885 / 2326:45900; account rows reuse 1108:5658 / 1109:5653. */
export function CardBankStep({
  accounts,
  selectedId,
  disabled,
  onSelect,
}: {
  accounts: readonly BetaBankAccount[];
  selectedId?: string;
  disabled: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <View style={{ gap: 20 }}>
      <CardHint>Choose the account this card will be connected to.</CardHint>
      <CardHeading>
        {accounts.length ? "Choose an account" : "Connect your bank account"}
      </CardHeading>
      {accounts.length ? (
        accounts.map((account) => {
          const selected = account.id === selectedId;
          return (
            <Pressable
              key={account.id}
              accessibilityRole="radio"
              accessibilityLabel={`${account.name}, sample account ending in ${account.last4}`}
              accessibilityState={{ checked: selected, disabled }}
              aria-checked={selected}
              disabled={disabled}
              onPress={() => onSelect(account.id)}
              style={{
                minHeight: 72,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 12,
                gap: 12,
                flexDirection: "row",
                alignItems: "center",
                borderWidth: selected ? 1.5 : 1,
                borderColor: selected ? theme.teal : "#C9DED8",
                backgroundColor: selected ? "#E3F6F0" : "white",
              }}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Label
                  style={{
                    fontSize: 16,
                    lineHeight: 24,
                    fontFamily: "Inter_600SemiBold",
                  }}
                >
                  {account.name}
                </Label>
                <Label
                  style={{ fontSize: 13, lineHeight: 18, color: "#596562" }}
                >{`Sample account ending in ${account.last4}`}</Label>
              </View>
              <CardSelection selected={selected} />
            </Pressable>
          );
        })
      ) : (
        <CardHint>
          Connect an account in your name, then choose it for this Card.
        </CardHint>
      )}
      <CardHint>{betaBankNotice}</CardHint>
    </View>
  );
}
