import { useState } from "react";
import { View, Switch } from "react-native";
import { router, useLocalSearchParams, type Href } from "expo-router";
import {
  Shell,
  Title,
  Muted,
  Label,
  Field,
  Action,
  Link,
  Avatar,
  AuthGate,
  ResourceState,
  ErrorText,
  styles,
} from "@/design/system";
import {
  useClient,
  useResource,
  useAction,
  useCommand,
} from "@/services/client";
import type { Circle, Person } from "@/features/potluck/types";
export default function Settings() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { user } = useClient(),
    r = useResource<Circle>(user ? "/circles/" + id : null);
  if (!r.data)
    return (
      <Shell title="Circle settings" back>
        <AuthGate returnTo={"/circle/" + id + "/settings"}>
          <ResourceState {...r} retry={r.reload} />
        </AuthGate>
      </Shell>
    );
  return <Editor key={r.data.id + ":" + r.data.version} circle={r.data} />;
}
function Editor({ circle }: { circle: Circle }) {
  const { user } = useClient(),
    act = useAction(),
    command = useCommand(),
    [name, setName] = useState(circle.name),
    [description, setDescription] = useState(circle.description),
    [anonymous, setAnonymous] = useState(circle.privacy === "anonymous"),
    [intent, setIntent] = useState<
      "remove" | "transfer" | "archive" | "leave" | null
    >(null),
    [person, setPerson] = useState<Person | null>(null),
    [notice, setNotice] = useState("");
  const host = circle.hostId === user?.id;
  async function save() {
    await act.run(async () => {
      if (intent) {
        await command("/circles/" + circle.id + "/" + intent, {
          expectedVersion: circle.version,
          ...(intent === "transfer"
            ? { userId: person!.id }
            : {
                acknowledged: true,
                ...(intent === "remove" ? { userId: person!.id } : {}),
              }),
        });
        if (intent === "transfer") {
          setNotice(
            "Hosting invitation sent. You remain Circle Host until they accept.",
          );
          setIntent(null);
        } else
          router.replace(
            (intent === "remove" ? "/circle/" + circle.id : "/circles") as Href,
          );
      } else {
        await command("/circles/" + circle.id + "/edit", {
          name,
          description,
          privacy: anonymous ? "anonymous" : "normal",
          expectedVersion: circle.version,
        });
        router.back();
      }
    });
  }
  return (
    <Shell
      title="Circle settings"
      back
      footer={
        <>
          <ErrorText text={act.error} />
          {(host || intent) && (
            <Action
              label={
                intent
                  ? {
                      remove: "Remove member",
                      transfer: "Send hosting invitation",
                      archive: "Archive Circle",
                      leave: "Leave Circle",
                    }[intent]
                  : "Save changes"
              }
              danger={
                intent === "remove" ||
                intent === "archive" ||
                intent === "leave"
              }
              disabled={act.busy || !name.trim()}
              onPress={save}
            />
          )}{" "}
          {intent && (
            <Action
              secondary
              label="Keep as it is"
              onPress={() => setIntent(null)}
            />
          )}
        </>
      }
    >
      {intent ? (
        <>
          <Title>
            {intent === "transfer"
              ? "Invite " + person?.name + " to host"
              : intent === "remove"
                ? "Remove " + person?.name
                : intent === "archive"
                  ? "Archive this Circle?"
                  : "Leave this Circle?"}
          </Title>
          <Muted>
            {intent === "transfer"
              ? "They must accept before Circle hosting changes. This never transfers any Card, Bill, bank account or financial responsibility."
              : "Circle membership and independent financial arrangements are separate. Bill agreements and Card ownership remain unchanged. No external service is canceled and no funds are moved."}
          </Muted>
        </>
      ) : (
        <>
          {notice && <Muted>{notice}</Muted>}
          {host ? (
            <>
              <Field
                label="Circle name"
                value={name}
                onChangeText={setName}
                maxLength={80}
              />
              <Field
                label="About your Circle"
                value={description}
                onChangeText={setDescription}
                maxLength={400}
              />
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Title small>Anonymous Circle</Title>
                  <Muted>
                    Members’ identities stay private from one another.
                  </Muted>
                </View>
                <Switch
                  accessibilityLabel="Anonymous Circle"
                  value={anonymous}
                  onValueChange={setAnonymous}
                />
              </View>
              <Title>People</Title>
              {circle.people
                .filter((p) => p.id !== user?.id)
                .map((p) => (
                  <View key={p.id} style={{ gap: 8, paddingVertical: 10 }}>
                    <View style={styles.row}>
                      <Avatar name={p.name} />
                      <Label>{p.name}</Label>
                    </View>
                    <Link
                      onPress={() => {
                        setPerson(p);
                        setIntent("transfer");
                      }}
                    >
                      Invite to become Circle Host
                    </Link>
                    <Link
                      danger
                      onPress={() => {
                        setPerson(p);
                        setIntent("remove");
                      }}
                    >
                      Remove from Circle
                    </Link>
                  </View>
                ))}
              <Link danger onPress={() => setIntent("archive")}>
                Archive Circle
              </Link>
              <Muted>
                To leave, invite another member to become Circle Host first.
              </Muted>
            </>
          ) : (
            <>
              <Title>{circle.name}</Title>
              <Link danger onPress={() => setIntent("leave")}>
                Leave Circle
              </Link>
            </>
          )}
        </>
      )}
    </Shell>
  );
}
