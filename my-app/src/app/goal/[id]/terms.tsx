import { useLocalSearchParams } from "expo-router";
import {
  Shell,
  AuthGate,
  Title,
  Muted,
  Row,
  Action,
  ResourceState,
  money,
  dateLabel,
  go,
} from "@/design/system";
import { useClient, useResource } from "@/services/client";
import { GoalBoundary, GoalSummary } from "@/features/potluck/goal-ui";
import type { Goal } from "@/features/potluck/goal-model";
export default function GoalTerms() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { user } = useClient(),
    resource = useResource<Goal>(user ? "/goals/" + id : null),
    goal = resource.data;
  return (
    <Shell
      title="Contribution terms"
      back
      active="Cards"
      footer={goal && <Action label="Done" onPress={() => go("/goal/" + id)} />}
    >
      <AuthGate returnTo={"/goal/" + id + "/terms"}>
        <ResourceState
          loading={resource.loading}
          error={resource.error}
          retry={resource.reload}
        />
        {goal && (
          <>
            <Muted>A preview of the terms each contributor would review.</Muted>
            <GoalSummary goal={goal} />
            <Title small>What people would accept</Title>
            {goal.plannedContributions.map((p) => (
              <Row
                key={p.personId}
                title={p.name}
                subtitle={money(p.amountMinor) + " · " + goal.frequency}
              />
            ))}
            <Row
              title="Ending condition"
              subtitle={
                goal.kind === "target"
                  ? "Stops once " + money(goal.targetMinor ?? 0) + " is settled"
                  : goal.endDate
                    ? "Ends " + dateLabel(goal.endDate)
                    : "Until the contributor cancels"
              }
            />
            <Row
              title="Their control"
              subtitle="They can cancel future charges."
            />
            <Row
              title="Funds release preference"
              subtitle={
                goal.lockFundsRequested
                  ? "Release at Goal end requested · not active"
                  : "No funds lock requested"
              }
            />
            <Row
              title="Contribution visibility preference"
              subtitle={
                goal.showContributions
                  ? "Show contributions in the attached non-anonymous Circle"
                  : "Keep individual contributions private"
              }
            />
            <Muted>
              No contribution starts until that person accepts their terms and
              chooses their funding source. These actions are not available yet.
            </Muted>
            <GoalBoundary />
          </>
        )}
      </AuthGate>
    </Shell>
  );
}
