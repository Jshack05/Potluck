import { useState } from "react";
import { Image } from "expo-image";
import { View, Pressable, Switch } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  Shell,
  Title,
  Label,
  Muted,
  Field,
  Action,
  Link,
  ResourceState,
  Avatar,
  ErrorText,
  Icon,
  Divider,
  go,
  money,
  theme,
  styles,
} from "@/design/system";
import {
  useClient,
  useResource,
  useAction,
  useCommand,
} from "@/services/client";
import { BrandMark } from "./discovery";
import type { Listing, ListingRequest, Collection } from "./types";
export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    { user } = useClient(),
    data = useResource<Listing>("/listings/" + id),
    requests = useResource<Collection<ListingRequest>>(
      user ? "/requests" : null,
    ),
    act = useAction(),
    command = useCommand();
  const [writing, setWriting] = useState(false),
    [text, setText] = useState(""),
    [agree, setAgree] = useState(false),
    [sent, setSent] = useState(false),
    [saved, setSaved] = useState(false),
    [report, setReport] = useState(false),
    [reason, setReason] = useState("");
  const item = data.data,
    existing = requests.data?.items.find(
      (r) =>
        r.listingId === id &&
        r.requesterId === user?.id &&
        (r.listingVersion === item?.version || r.status === "accepted"),
    ),
    own = item?.hostId === user?.id;
  const send = () =>
    act.run(async () => {
      const result = await command<{ conversationId?: string }>(
        "/listings/" + id + "/requests",
        {
          message: text,
          acceptedRules: agree,
          rulesVersion: "2026-10-04",
          listingVersion: item?.version,
        },
      );
      if (result.conversationId) go("/conversation/" + result.conversationId);
      else setSent(true);
    });
  const primary = () => {
    if (!user) {
      go("/sign-in?returnTo=" + encodeURIComponent("/listing/" + id));
      return;
    }
    if (writing) void send();
    else setWriting(true);
  };
  return (
    <Shell
      title={
        sent
          ? "Request sent"
          : writing
            ? "Start a conversation"
            : "Listing details"
      }
      blue
      back
      active="Splitfinder"
      returnTo="/discover"
      footer={
        item ? (
          <>
            <ErrorText text={act.error} />
            {sent || existing ? (
              <Action label="Open inbox" onPress={() => go("/inbox")} />
            ) : own ? (
              <Action
                secondary
                label="Manage listing"
                onPress={() => go("/my-listings")}
              />
            ) : (
              <Action
                label={
                  writing
                    ? item.category === "housing"
                      ? "Send inquiry"
                      : "Send request"
                    : "Connect with " + item.hostName.split(" ")[0]
                }
                disabled={act.busy || (writing && (!agree || !text.trim()))}
                onPress={primary}
              />
            )}
          </>
        ) : undefined
      }
    >
      <ResourceState {...data} retry={data.reload} />
      {item &&
        (sent ? (
          <>
            <View style={{ alignItems: "center", paddingTop: 32 }}>
              <Icon name="lucky" size={125} />
            </View>
            <Title>Your introduction is on its way</Title>
            <Muted>
              {item.hostName} can review your message. If they accept, a
              conversation opens in your Inbox.
            </Muted>
            <Divider />
            <Title small>{item.title}</Title>
            <Muted>
              A conversation gives you both space to decide whether the
              arrangement fits. Joining a Circle is a separate step.
            </Muted>
          </>
        ) : (
          <>
            <View style={styles.row}>
              <BrandMark brand={item.brand} />
              <View style={{ flex: 1 }}>
                <Title>{item.title}</Title>
                {item.brand ? <Muted>{item.brand}</Muted> : null}
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => go("/profile/" + item.hostId)}
              style={[styles.row, { paddingVertical: 8 }]}
            >
              <Avatar name={item.hostName} />
              <View style={{ flex: 1 }}>
                <Label style={{ fontFamily: "Inter_600SemiBold" }}>
                  {item.hostName}
                </Label>
                <Muted>Listing host</Muted>
              </View>
              <Label>›</Label>
            </Pressable>
            {writing ? (
              <>
                <Field
                  label="Introduce yourself"
                  value={text}
                  onChangeText={setText}
                  multiline
                  maxLength={2000}
                  placeholder="Share what you’re looking for and ask about the arrangement."
                />
                <Link onPress={() => go("/sharing-rules")}>
                  Read the Sharing Rules
                </Link>
                <View style={styles.row}>
                  <Switch
                    accessibilityLabel="I agree to the Sharing Rules"
                    value={agree}
                    onValueChange={setAgree}
                  />
                  <View style={{ flex: 1 }}>
                    <Label>
                      I have read the Sharing Rules and confirm I meet this
                      arrangement’s sharing requirements.
                    </Label>
                  </View>
                </View>
                <Muted>
                  This sends an introduction. It does not join a Circle or
                  authorize a charge.
                </Muted>
              </>
            ) : (
              <>
                <View style={{ paddingVertical: 10, gap: 4 }}>
                  <Muted>Your proposed share</Muted>
                  <Label
                    style={{
                      fontSize: 36,
                      lineHeight: 44,
                      color: theme.blue,
                      fontFamily: "Inter_700Bold",
                    }}
                  >
                    {money(item.shareMinor)}
                    <Label> / month</Label>
                  </Label>
                  <Muted>Per person · Confirm the terms with the host.</Muted>
                </View>
                {item.totalMinor !== null && item.category !== "housing" && (
                  <View
                    style={{
                      backgroundColor: "#EAF8F1",
                      borderRadius: 14,
                      padding: 16,
                      flexDirection: "row",
                      gap: 14,
                      alignItems: "center",
                    }}
                  >
                    <Image
                      source={require("../../../assets/splitfinder/savings.png")}
                      style={{ width: 44, height: 44 }}
                      contentFit="contain"
                    />
                    <View style={{ flex: 1, gap: 4 }}>
                      <Label
                        style={{
                          color: theme.teal,
                          fontFamily: "Inter_700Bold",
                        }}
                      >
                        Your savings
                      </Label>
                      <Label
                        style={{
                          color: theme.teal,
                          fontSize: 22,
                          fontFamily: "Inter_700Bold",
                        }}
                      >
                        {money(item.totalMinor - item.shareMinor)} / month
                      </Label>
                      <Muted>
                        {money((item.totalMinor - item.shareMinor) * 12)} /
                        year*
                      </Muted>
                      <Muted>
                        Compared with the host’s {money(item.totalMinor)} full
                        plan price. *Assumes the same prices for 12 months.
                      </Muted>
                    </View>
                  </View>
                )}
                <Divider />
                <Title small>About this arrangement</Title>
                <Label>{item.description}</Label>
                <View style={styles.row}>
                  <Icon name="circles" />
                  <Label>
                    {item.capacity - item.filled} open · {item.filled} of{" "}
                    {item.capacity} filled
                  </Label>
                </View>
                {item.location ? <Muted>{item.location}</Muted> : null}
                {existing && (
                  <Muted>
                    Request {existing.status}. Find the latest update in your
                    Inbox.
                  </Muted>
                )}
                <Divider />
                <Muted>
                  Posted by a community member. Potluck is not affiliated with{" "}
                  {item.brand || "the service provider"}. Check the provider’s
                  current sharing terms before joining.
                </Muted>
                {user && !own && (
                  <>
                    <Link
                      onPress={() =>
                        act.run(async () => {
                          await command("/listings/" + id + "/save", {
                            saved: !saved,
                          });
                          setSaved(!saved);
                        })
                      }
                    >
                      {saved ? "Remove from saved" : "Save this listing"}
                    </Link>
                    <Link onPress={() => setReport(!report)}>
                      Report listing
                    </Link>
                    {report && (
                      <>
                        <Field
                          label="What’s wrong?"
                          value={reason}
                          onChangeText={setReason}
                          multiline
                        />
                        <Action
                          secondary
                          label="Submit report"
                          disabled={act.busy || reason.trim().length < 5}
                          onPress={() =>
                            act.run(async () => {
                              await command("/listings/" + id + "/report", {
                                reason,
                              });
                              setReport(false);
                              setReason("");
                              act.setError("Report received.");
                            })
                          }
                        />
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </>
        ))}
    </Shell>
  );
}
