import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useCallback } from "react";
import { draftAfterSend } from "@/features/potluck/presentation-state";
import { View, Pressable } from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import {
  Shell,
  Title,
  Muted,
  Label,
  Avatar,
  Field,
  Action,
  Link,
  Row,
  ResourceState,
  AuthGate,
  ErrorText,
  go,
  theme,
  styles,
} from "@/design/system";
import {
  useClient,
  useResource,
  useAction,
  useCommand,
} from "@/services/client";
import type {
  Conversation,
  Collection,
  Circle,
  Message,
} from "@/features/potluck/types";
export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { user } = useClient();
  return <ConversationEditor key={(user?.id ?? "guest") + ":" + id} />;
}
function ConversationEditor() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { user, get } = useClient(),
    thread = useResource<Conversation>(user ? "/conversations/" + id : null),
    circles = useResource<Collection<Circle>>(user ? "/circles" : null),
    act = useAction(),
    command = useCommand();
  const paging = useAction();
  const [history, setHistory] = useState<Message[]>([]),
    [before, setBefore] = useState<string | null | undefined>(undefined);
  function merge(left: Message[], right: Message[]) {
    return [
      ...new Map(
        [...left, ...right].map((message) => [message.id, message]),
      ).values(),
    ].sort(
      (a, b) =>
        a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id),
    );
  }
  const [previousMessages, setPreviousMessages] = useState<
    Message[] | undefined
  >();
  if (thread.data && previousMessages !== thread.data.messages) {
    setPreviousMessages(thread.data.messages);
    setHistory((current) => merge(current, thread.data!.messages));
  }
  const olderCursor = before === undefined ? thread.data?.nextBefore : before;
  const [text, setText] = useState(""),
    [failed, setFailed] = useState<string | null>(null),
    [actions, setActions] = useState(false),
    [invite, setInvite] = useState(false),
    [notice, setNotice] = useState("");
  const c = thread.data,
    other = c
      ? c.hostId === user?.id
        ? c.participantName
        : c.hostName
      : "Conversation";
  const draftKey = user ? "potluck.draft.message." + user.id + "." + id : null;
  const [draftReady, setDraftReady] = useState(false),
    [draftError, setDraftError] = useState("");
  useEffect(() => {
    let active = true;
    if (!draftKey) return;
    void AsyncStorage.getItem(draftKey)
      .then((value) => {
        if (active && value) {
          const draft = JSON.parse(value);
          setText(
            typeof draft.text === "string" ? draft.text.slice(0, 2000) : "",
          );
          setFailed(
            typeof draft.failed === "string"
              ? draft.failed.slice(0, 2000)
              : null,
          );
        }
      })
      .catch(() => {
        if (active) setDraftError("Your saved message could not be restored.");
      })
      .finally(() => {
        if (active) setDraftReady(true);
      });
    return () => {
      active = false;
    };
  }, [draftKey]);
  useEffect(() => {
    if (draftKey && draftReady)
      void AsyncStorage.setItem(
        draftKey,
        JSON.stringify({ text, failed }),
      ).catch(() =>
        setDraftError("Your message draft could not be saved on this device."),
      );
  }, [draftKey, draftReady, text, failed]);
  const { reload } = thread;
  useFocusEffect(
    useCallback(() => {
      const timer = setInterval(() => void reload(), 15000);
      return () => clearInterval(timer);
    }, [reload]),
  );
  async function send(value: string) {
    await act.run(async () => {
      try {
        await command("/conversations/" + id + "/messages", { text: value });
        setText((current) => draftAfterSend(current, value));
        setFailed(null);
        setActions(false);
        await thread.reload();
      } catch (e) {
        setFailed(value);
        setText((current) => draftAfterSend(current, value));
        throw e;
      }
    });
  }
  return (
    <Shell
      title={other}
      back
      returnTo="/inbox"
      footer={
        user && c && !c.blocked ? (
          <>
            <ErrorText text={draftError || (failed ? undefined : act.error)} />
            <View style={[styles.row, { alignItems: "flex-end" }]}>
              <View style={{ flex: 1 }}>
                <Field
                  label="Message"
                  value={text}
                  onChangeText={setText}
                  multiline
                  maxLength={2000}
                  style={{ minHeight: 56, maxHeight: 130 }}
                />
              </View>
              <Action
                label="Send"
                disabled={act.busy || !text.trim() || !draftReady}
                onPress={() => send(text)}
              />
            </View>
          </>
        ) : undefined
      }
    >
      <AuthGate returnTo={"/conversation/" + id}>
        <ResourceState
          loading={thread.loading && !c}
          error={thread.error}
          retry={thread.reload}
        />
        {c && (
          <>
            <View style={styles.row}>
              <Avatar name={other} />
              <View style={{ flex: 1 }}>
                <Title small>{c.listingTitle}</Title>
                <Muted>Conversation open</Muted>
              </View>
            </View>
            <Muted>
              Say hello and discuss the arrangement. You each decide whether to
              continue.
            </Muted>
            <ErrorText text={paging.error} />
            {olderCursor && (
              <Link
                onPress={() =>
                  paging.run(async () => {
                    const page = await get<Conversation>(
                      "/conversations/" + id + "?before=" + olderCursor,
                    );
                    setHistory((current) => merge(page.messages, current));
                    setBefore(page.nextBefore);
                  })
                }
              >
                {paging.busy ? "Loading earlier messages…" : "Earlier messages"}
              </Link>
            )}
            {merge(history, c.messages).map((m) => (
              <View
                key={m.id}
                style={{
                  alignSelf:
                    m.senderId === user?.id ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  backgroundColor:
                    m.senderId === user?.id ? theme.blue : "white",
                  borderRadius: 18,
                  padding: 14,
                  gap: 3,
                }}
              >
                <Label
                  style={{
                    color: m.senderId === user?.id ? "white" : theme.ink,
                  }}
                >
                  {m.text}
                </Label>
                <Label
                  style={{
                    fontSize: 11,
                    color: m.senderId === user?.id ? "#E4F1FC" : theme.muted,
                  }}
                >
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Label>
              </View>
            ))}
            {failed && (
              <View style={{ gap: 8 }}>
                <View style={[styles.row, { justifyContent: "flex-end" }]}>
                  <View
                    style={{
                      maxWidth: "78%",
                      backgroundColor: theme.blue,
                      borderRadius: 18,
                      padding: 14,
                    }}
                  >
                    <Label style={{ color: "white" }}>{failed}</Label>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Message failed. Show retry options"
                    onPress={() => setActions(!actions)}
                    style={{
                      width: 44,
                      height: 44,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Label
                      style={{
                        borderWidth: 2,
                        borderColor: theme.danger,
                        color: theme.danger,
                        borderRadius: 12,
                        width: 24,
                        height: 24,
                        textAlign: "center",
                        lineHeight: 20,
                        fontFamily: "Inter_700Bold",
                      }}
                    >
                      !
                    </Label>
                  </Pressable>
                </View>
                <Muted>Not sent</Muted>
                {actions && (
                  <>
                    <ErrorText text={act.error} />
                    <Link onPress={() => send(failed)}>Retry message</Link>
                    <Link
                      onPress={() => {
                        setText(failed);
                        setFailed(null);
                        setActions(false);
                      }}
                    >
                      Edit message
                    </Link>
                  </>
                )}
              </View>
            )}
            {c.blocked ? (
              <Muted>Messaging is unavailable for this conversation.</Muted>
            ) : (
              <>
                <Link onPress={() => setInvite(!invite)}>
                  Continue with a Circle
                </Link>
                {invite && (
                  <>
                    <Title small>Invite them separately</Title>
                    <Muted>
                      Choose a Circle you host. They can review the invitation
                      before joining.
                    </Muted>
                    {circles.data?.items
                      .filter((x) => x.hostId === user?.id)
                      .map((x) => (
                        <Row
                          key={x.id}
                          title={x.name}
                          icon="circles"
                          onPress={() =>
                            act.run(async () => {
                              await command(
                                "/conversations/" + id + "/circle-invitation",
                                { circleId: x.id },
                              );
                              setNotice(
                                "Circle invitation sent. They’ll find it in their Inbox.",
                              );
                              setInvite(false);
                            })
                          }
                        />
                      ))}
                    <Link
                      onPress={() => go("/create/circle?conversationId=" + id)}
                    >
                      Create a Circle together
                    </Link>
                  </>
                )}
                <Link
                  danger
                  onPress={() =>
                    act.run(async () => {
                      await command("/blocks", {
                        userId:
                          c.hostId === user?.id ? c.participantId : c.hostId,
                      });
                      await thread.reload();
                    })
                  }
                >
                  Block this person
                </Link>
              </>
            )}
            {notice && <Muted>{notice}</Muted>}
          </>
        )}
      </AuthGate>
    </Shell>
  );
}
