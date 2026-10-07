import { Image } from "expo-image";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  Action,
  AuthGate,
  Divider,
  Label,
  Muted,
  ResourceState,
  Shell,
  Title,
  go,
  money,
  styles,
} from "@/design/system";
import { useClient, useResource } from "@/services/client";
import {
  BillIcon,
  BillPanel,
  BillInfo,
  billStyles,
} from "@/features/potluck/bill-ui";
import type { Bill } from "@/features/potluck/types";

export default function BillRecovery() {
  const { id, agreementId } = useLocalSearchParams<{
      id: string;
      agreementId?: string;
    }>(),
    { user } = useClient();
  const resource = useResource<Bill>(user ? "/bills/" + id : null),
    bill = resource.data;
  const agreement = bill?.agreements.find((item) => item.id === agreementId);
  const aboveMaximum =
    !!agreement &&
    agreement?.participantId === user?.id &&
    agreement.status === "accepted" &&
    agreement.terms.kind === "flexible" &&
    agreement.amountMinor > agreement.maximumMinor;
  const declined =
    bill?.hostId === user?.id && agreement?.status === "declined";
  return (
    <Shell
      title="Contribution review"
      back
      hideNavigation
      active="Bills"
      footer={
        aboveMaximum ? (
          <>
            <Action
              label="Review your agreement"
              onPress={() => go("/agreement/" + agreement!.id)}
            />
            <Action
              secondary
              label="Message the host"
              onPress={() => go("/agreement/" + agreement!.id + "?view=ask")}
            />
          </>
        ) : declined ? (
          <>
            <Action
              label="Revise proposal"
              onPress={() => go("/create/bill?id=" + id)}
            />
            <Action
              secondary
              label="Back to bill"
              onPress={() => go("/bill/" + id)}
            />
          </>
        ) : (
          <Action label="Back to bill" onPress={() => go("/bill/" + id)} />
        )
      }
    >
      <AuthGate returnTo={"/bill/" + id + "/recovery"}>
        <ResourceState {...resource} retry={resource.reload} />
        {bill && (
          <>
            <Image
              source={require("../../../../assets/potluck/bill/updated-terms.svg")}
              style={{ width: 64, height: 64, alignSelf: "center" }}
              contentFit="contain"
            />
            <Title>
              {aboveMaximum
                ? "This share exceeds your maximum"
                : declined
                  ? "Your proposal was declined"
                  : "Review this bill"}
            </Title>
            <Muted>
              {aboveMaximum
                ? "Your accepted maximum remains in place. No contribution can start at this amount."
                : declined
                  ? "The contributor has not accepted these terms."
                  : "Review current terms and next steps."}
            </Muted>
            <BillPanel>
              <View style={styles.row}>
                <BillIcon name={bill.icon} />
                <Title small>{bill.name}</Title>
              </View>
              <Divider />
              {aboveMaximum ? (
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Muted>Your maximum</Muted>
                    <Label style={[billStyles.amount, { fontSize: 28 }]}>
                      {money(agreement!.maximumMinor)}
                    </Label>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Muted>Estimated share</Muted>
                    <Label style={[billStyles.amount, { fontSize: 28 }]}>
                      {money(agreement!.amountMinor)}
                    </Label>
                  </View>
                </View>
              ) : (
                <Muted>
                  {agreement
                    ? money(agreement.amountMinor) + " · " + agreement.status
                    : "Open your agreement for current terms."}
                </Muted>
              )}
            </BillPanel>
            <BillInfo>
              {aboveMaximum
                ? "Your maximum is a hard stop, not a partial payment. A one-time exception is not available in this build. Ask the host for revised terms; the difference is never passed to other people."
                : "Earlier accepted terms remain in place unless separately canceled. Revising a proposal requires renewed acceptance and does not move money."}
            </BillInfo>
          </>
        )}
      </AuthGate>
    </Shell>
  );
}
