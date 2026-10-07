import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import {
  Action,
  AuthGate,
  Icon,
  Label,
  Muted,
  Shell,
  Title,
  go,
  styles,
} from "@/design/system";
import { BillIcon, BillPanel, BillInfo } from "@/features/potluck/bill-ui";

/** Suggestions remain absent until a real bank import adapter exists. */
export default function ImportBills() {
  const [step, setStep] = useState<"source" | "account">("source");
  const back = () =>
    step === "account"
      ? setStep("source")
      : router.canGoBack()
        ? router.back()
        : router.replace("/bills");
  return (
    <Shell
      title={step === "source" ? "Import bills" : "Connect an account"}
      back
      onBack={back}
      hideNavigation
      active="Bills"
      footer={
        <>
          <Action
            label="Connect an account"
            onPress={() =>
              step === "source"
                ? setStep("account")
                : go("/connect-bank?returnTo=%2Fimport-bills")
            }
          />
          <Action
            secondary
            label={step === "source" ? "Add manually" : "Add manually instead"}
            onPress={() => go("/create/bill")}
          />
        </>
      }
    >
      <AuthGate returnTo="/import-bills">
        <View style={{ gap: 24, paddingTop: 44, flex: 1 }}>
          <BillIcon />
          <Title>
            {step === "source"
              ? "Find bills you already pay"
              : "Find your recurring bills"}
          </Title>
          <Muted>
            {step === "source"
              ? "Bring recurring bills into Potluck, then choose which ones to share."
              : "Choose an account to look for recurring charges."}
          </Muted>
          {step === "source" ? (
            <View style={{ gap: 24 }}>
              <BillInfo>
                Bank import isn&apos;t connected in this build. You can add a
                bill manually now.
              </BillInfo>
              <BillPanel mint>
                <Label style={{ fontFamily: "Inter_600SemiBold" }}>
                  Review before adding
                </Label>
                <Muted>Choose the bills you want to bring into Potluck.</Muted>
              </BillPanel>
            </View>
          ) : (
            <>
              <BillPanel>
                <View style={styles.row}>
                  <Icon name="bank" size={32} />
                  <Title small>Connected accounts</Title>
                </View>
                <Muted>
                  No eligible accounts are available for bill import.
                </Muted>
              </BillPanel>
              <BillInfo>
                Bank import is not connected yet. No account activity has been
                read and no recurring charges have been detected. You can add a
                bill manually now.
              </BillInfo>
            </>
          )}
        </View>
      </AuthGate>
    </Shell>
  );
}
