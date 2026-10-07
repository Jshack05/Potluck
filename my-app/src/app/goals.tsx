import { useState } from "react";
import { Pressable, View } from "react-native";
import {
  Shell,
  AuthGate,
  Muted,
  Action,
  ResourceState,
  go,
} from "@/design/system";
import { useClient, useResource } from "@/services/client";
import { GoalSummary } from "@/features/potluck/goal-ui";
import type { Goal } from "@/features/potluck/goal-model";
import type { Collection } from "@/features/potluck/types";
export default function Goals() {
  const { user } = useClient();
  const [page, setPage] = useState({ owner: user?.id, offset: 0 });
  const offset = page.owner === user?.id ? page.offset : 0;
  const resource = useResource<Collection<Goal>>(
    user ? "/goals?offset=" + offset : null,
  );
  return (
    <Shell
      title="Your Goals"
      back
      active="Cards"
      footer={<Action label="Create Goal" onPress={() => go("/create/goal")} />}
    >
      <AuthGate returnTo="/goals">
        <ResourceState
          loading={resource.loading}
          data={resource.data}
          error={resource.error}
          retry={resource.reload}
        />
        {resource.data?.items.map((goal) => (
          <Pressable
            key={goal.id}
            accessibilityRole="button"
            accessibilityLabel={"Open " + goal.name}
            onPress={() => go("/goal/" + goal.id)}
          >
            <GoalSummary goal={goal} />
          </Pressable>
        ))}
        {resource.data && !resource.data.items.length && offset === 0 && (
          <Muted>
            Save a shared purpose, choose a target or duration, and plan each
            person’s contribution.
          </Muted>
        )}
        <View style={{ gap: 12 }}>
          {offset > 0 && (
            <Action
              secondary
              label="Newer Goals"
              disabled={resource.loading}
              onPress={() =>
                setPage({ owner: user?.id, offset: Math.max(0, offset - 50) })
              }
            />
          )}
          {resource.data?.nextOffset != null && (
            <Action
              secondary
              label="Older Goals"
              disabled={resource.loading}
              onPress={() =>
                setPage({
                  owner: user?.id,
                  offset: resource.data!.nextOffset!,
                })
              }
            />
          )}
        </View>
      </AuthGate>
    </Shell>
  );
}
