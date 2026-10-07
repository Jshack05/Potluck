import { useState } from "react";
import { router, type Href, useLocalSearchParams } from "expo-router";
import {
  Shell,
  AuthGate,
  Muted,
  Action,
  ErrorText,
  ResourceState,
  go,
} from "@/design/system";
import {
  useAction,
  useClient,
  useCommand,
  useResource,
} from "@/services/client";
import type { Person } from "@/features/potluck/types";
import type {
  CircleDetail,
  CircleTransfer,
} from "@/features/potluck/circle-model";
import { CircleHeading, CirclePersonRow } from "@/features/potluck/circle-ui";
export default function Handover() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { user } = useClient(),
    resource = useResource<CircleDetail>(user ? "/circles/" + id : null),
    circle = resource.data,
    [person, setPerson] = useState<Person | null>(null),
    action = useAction(),
    command = useCommand();
  const host = circle?.role === "host",
    others = circle?.people.filter((p) => p.id !== user?.id) ?? [];
  return (
    <Shell
      title="Potluck"
      continuation
      back
      active="Circles"
      onBack={person ? () => setPerson(null) : undefined}
      footer={
        circle && (
          <>
            <ErrorText text={action.error} />
            {person && host ? (
              <>
                <Action
                  label="Choose someone else"
                  secondary
                  disabled={action.busy}
                  onPress={() => setPerson(null)}
                />
                <Action
                  label="Send handover request"
                  disabled={action.busy}
                  onPress={() =>
                    action.run(async () => {
                      const transfer = await command<CircleTransfer>(
                        "/circles/" + id + "/transfer",
                        { userId: person.id, expectedVersion: circle.version },
                      );
                      router.replace(
                        ("/circle-transfer/" + transfer.id) as Href,
                      );
                    })
                  }
                />
              </>
            ) : (
              <Action
                label="Keep my role"
                onPress={() => go("/circle/" + id + "/settings")}
              />
            )}
          </>
        )
      }
    >
      <AuthGate returnTo={"/circle/" + id + "/handover"}>
        <ResourceState {...resource} retry={resource.reload} />
        {circle &&
          (host ? (
            person ? (
              <>
                <CircleHeading>Ask {person.name} to become host?</CircleHeading>
                <CirclePersonRow
                  name={person.name}
                  subtitle="Proposed Circle Host"
                />
                <Muted>
                  You remain Circle Host until {person.name} accepts. After
                  acceptance, you remain a member.
                </Muted>
              </>
            ) : (
              <>
                <CircleHeading>Choose the next Circle Host</CircleHeading>
                <Muted>
                  The new host must accept before your role changes.
                </Muted>
                {others.map((member) => (
                  <CirclePersonRow
                    key={member.id}
                    name={member.name}
                    subtitle="Circle member"
                    onPress={() => setPerson(member)}
                  />
                ))}
                {!others.length && (
                  <Muted>
                    Invite another person first. They must join before they can
                    become Circle Host.
                  </Muted>
                )}
                <Muted>
                  Circle Host status manages the group. It doesn’t transfer
                  ownership of Cards, Bills or funds.
                </Muted>
              </>
            )
          ) : (
            <>
              <CircleHeading>Your Circle Host manages handovers</CircleHeading>
              <Muted>
                Ask your current Circle Host to send a handover request.
              </Muted>
            </>
          ))}
      </AuthGate>
    </Shell>
  );
}
