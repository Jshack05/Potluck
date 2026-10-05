import { useLocalSearchParams } from "expo-router";
import {
  Shell,
  AuthGate,
  Title,
  Muted,
  Label,
  Section,
  Row,
  Action,
  ResourceState,
  theme,
  money,
  dateLabel,
  go,
} from "@/design/system";
import { useClient, useResource } from "@/services/client";
import type { Bill } from "@/features/potluck/types";
export default function BillDetail() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { user } = useClient(),
    resource = useResource<Bill>(user ? "/bills/" + id : null),
    bill = resource.data;
  const own = bill?.agreements.find(
    (a) => a.participantId === user?.id && a.status === "offered",
  );
  return (
    <Shell
      title={bill?.name ?? "Bill"}
      back
      active="Bills"
      footer={
        own && (
          <Action
            label="Review your share"
            onPress={() => go("/agreement/" + own.id)}
          />
        )
      }
    >
      <AuthGate returnTo={"/bill/" + id}>
        <ResourceState
          loading={resource.loading}
          error={resource.error}
          retry={resource.reload}
        />
        {bill && (
          <>
            <Muted>
              {bill.kind === "flexible" ? "Estimated Bill total" : "Bill total"}
            </Muted>
            <Label
              style={{
                fontFamily: "Inter_700Bold",
                fontSize: 44,
                lineHeight: 54,
                color: theme.teal,
              }}
            >
              {money(bill.amountMinor)}
            </Label>
            <Muted>
              {bill.frequency} · first due {dateLabel(bill.firstDueDate)}
            </Muted>
            {bill.maximumMinor && (
              <Muted>Bill maximum {money(bill.maximumMinor)}</Muted>
            )}
            <Section
              title={bill.role === "host" ? "Proposed shares" : "Your share"}
            />
            {bill.agreements
              .filter(
                (a) =>
                  a.status === "offered" ||
                  a.status === "accepted" ||
                  a.status === "canceled",
              )
              .map((a) => (
                <Row
                  key={a.id}
                  title={a.name ?? "Your contribution"}
                  subtitle={
                    a.status === "accepted"
                      ? "Terms accepted · funding not authorized"
                      : a.status === "offered"
                        ? "Waiting for acceptance"
                        : "Future agreement canceled"
                  }
                  icon={a.status === "accepted" ? "check" : "pending"}
                  right={<Label>{money(a.amountMinor)}</Label>}
                  onPress={
                    a.participantId === user?.id
                      ? () => go("/agreement/" + a.id)
                      : undefined
                  }
                />
              ))}
            <Section title="Payment status" />
            <Title small>No payment initiated</Title>
            <Muted>
              Agreement acceptance records the terms. Bank funding and merchant
              payments require separate setup.
            </Muted>
            {bill.circleId && (
              <Row
                title="Open Circle"
                icon="circles"
                onPress={() => go("/circle/" + bill.circleId)}
              />
            )}
            {bill.role === "host" && bill.cardId && (
              <Row
                title="Funding Card"
                subtitle="Setup required"
                icon="cards"
                onPress={() => go("/card/" + bill.cardId)}
              />
            )}
            {bill.role === "host" && bill.status !== "ended" && (
              <Row
                title="Manage arrangement"
                onPress={() => go("/manage/bills/" + id)}
              />
            )}
          </>
        )}
      </AuthGate>
    </Shell>
  );
}
