import { useLocalSearchParams } from "expo-router";
import {
  Shell,
  AuthGate,
  Title,
  Muted,
  Row,
  Action,
  ResourceState,
  dateLabel,
  go,
} from "@/design/system";
import { useClient, useResource } from "@/services/client";
import { GoalBoundary, GoalSummary } from "@/features/potluck/goal-ui";
import type { Goal } from "@/features/potluck/goal-model";
export default function GoalDetail() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { user } = useClient(),
    resource = useResource<Goal>(user ? "/goals/" + id : null),
    goal = resource.data;
  return (
    <Shell
      title={goal?.name ?? "Goal"}
      back
      active="Cards"
      footer={
        goal && (
          <Action
            label="View contribution terms"
            onPress={() => go("/goal/" + id + "/terms")}
          />
        )
      }
    >
      <AuthGate returnTo={"/goal/" + id}>
        <ResourceState
          loading={resource.loading}
          data={resource.data}
          error={resource.error}
          retry={resource.reload}
        />
        {goal && (
          <>
            <Muted>Your Goal plan is saved.</Muted>
            <GoalSummary goal={goal} />
            <Title small>Next up</Title>
            <Row
              title={
                goal.plannedContributions.length +
                (goal.plannedContributions.length === 1
                  ? " person planned"
                  : " people planned")
              }
              subtitle={
                goal.plannedContributions.map((p) => p.name).join(", ") ||
                "No contributors selected"
              }
            />
            <Row
              title="First contribution"
              subtitle={dateLabel(goal.firstContributionDate) + " · planned"}
            />
            {goal.circleId && (
              <Row
                title={goal.circleName ?? "Attached Circle"}
                icon="circles"
                onPress={() => go("/circle/" + goal.circleId)}
              />
            )}
            {goal.cardId && (
              <Row
                title={goal.cardName ?? "Attached Card"}
                icon="cards"
                onPress={() => go("/card/" + goal.cardId)}
              />
            )}
            <GoalBoundary />
          </>
        )}
      </AuthGate>
    </Shell>
  );
}
