import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import {
  Action,
  AuthGate,
  Divider,
  Label,
  Muted,
  ResourceState,
  Row,
  Shell,
  Title,
  dateLabel,
  go,
  money,
  styles,
} from "@/design/system";
import { useClient, useResource } from "@/services/client";
import {
  BillIcon,
  BillPanel,
  BillInfo,
  BillDetailRow,
  billStyles,
} from "@/features/potluck/bill-ui";
import type { Bill } from "@/features/potluck/types";

export default function BillPayment() {
  const { id, date } = useLocalSearchParams<{ id: string; date?: string }>(),
    { user } = useClient();
  const resource = useResource<Bill>(user ? "/bills/" + id : null),
    bill = resource.data;
  const agreement = bill?.agreements.find(
    (item) => item.participantId === user?.id && item.status === "accepted",
  );
  const selectedDate =
    date &&
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    Number.isFinite(new Date(date + "T12:00:00").getTime())
      ? date
      : bill?.firstDueDate;
  return (
    <Shell
      title="Contribution"
      back
      hideNavigation
      active="Bills"
      footer={
        agreement && bill?.status !== "ended" ? (
          <Action
            label="Set up funding account"
            onPress={() => go("/agreement/" + agreement.id + "?view=funding")}
          />
        ) : (
          <Action label="Back to bill" onPress={() => go("/bill/" + id)} />
        )
      }
    >
      <AuthGate returnTo={"/bill/" + id + "/payment"}>
        <ResourceState {...resource} retry={resource.reload} />
        {bill && (
          <>
            <Title>Review your contribution</Title>
            <Muted>Check the details before you send.</Muted>
            <BillPanel>
              <View style={styles.row}>
                <BillIcon name={bill.icon} />
                <Title small>{bill.name}</Title>
              </View>
              <Divider />
              <Muted>Your contribution</Muted>
              <Label style={billStyles.amount}>
                {agreement ? money(agreement.amountMinor) : "Not agreed"}
              </Label>
              <BillDetailRow
                label="For"
                value={
                  selectedDate ? dateLabel(selectedDate) : "Review schedule"
                }
              />
              <Divider />
              <BillDetailRow label="Method" value="One-time transfer" />
            </BillPanel>
            {agreement && bill.status !== "ended" ? (
              <>
                <Title small>Pay from</Title>
                <Row
                  title="Choose a funding account"
                  subtitle="No eligible account selected"
                  icon="bank"
                  onPress={() =>
                    go("/agreement/" + agreement.id + "?view=funding")
                  }
                />
                <BillInfo>
                  Transfers are not available yet. No money has been sent.
                  Connect an eligible account and review the final transfer
                  authorization when funding is available.
                </BillInfo>
                <Muted>This does not enable automatic payments.</Muted>
              </>
            ) : (
              <BillInfo>
                {bill.status === "ended"
                  ? "This bill has ended. Review its history for earlier terms."
                  : "Accept your own contribution terms before initiating a payment. Other people’s shares cannot be paid from this screen."}
              </BillInfo>
            )}
          </>
        )}
      </AuthGate>
    </Shell>
  );
}
