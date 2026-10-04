import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { listings } from "@/features/splitfinder/model";
import { usePreview } from "@/features/splitfinder/state";
import {
  Avatar,
  Button,
  Heading,
  Note,
  Panel,
  Screen,
  s,
} from "@/features/splitfinder/ui";
export default function Inbox() {
  const { messages, drafts } = usePreview();
  const threads = listings.filter(
    (item) => messages[item.id]?.length || drafts[item.id]?.trim(),
  );
  return (
    <Screen title="Inbox">
      <Heading style={{ fontSize: 22 }}>Conversations about listings</Heading>
      <Note>Splitfinder inquiries stay separate from ordinary messages.</Note>
      {threads.map((item) => (
        <Pressable
          key={item.id}
          accessibilityRole="button"
          accessibilityLabel={`Open inquiry about ${item.title}`}
          onPress={() =>
            router.push({ pathname: "/inquiry/[id]", params: { id: item.id } })
          }
        >
          <Panel style={s.row}>
            <Avatar name={item.host} photo={item.hostId === "jordan"} />
            <View style={{ flex: 1, gap: 4 }}>
              <Heading style={{ fontSize: 18, lineHeight: 24 }}>
                {item.host}
              </Heading>
              <Note>{item.title}</Note>
              <Note>
                {drafts[item.id]?.trim()
                  ? `Draft: ${drafts[item.id]}`
                  : messages[item.id]?.at(-1)}
              </Note>
            </View>
          </Panel>
        </Pressable>
      ))}
      {!threads.length && (
        <Panel>
          <Heading>No inquiries yet.</Heading>
          <Note>
            Find a plan you like, then open Message host to try the conversation
            screen.
          </Note>
          <Button
            label="Explore listings"
            onPress={() => router.push("/discover")}
          />
        </Panel>
      )}
      <Note>Practice messages are session-only and aren’t sent to anyone.</Note>
    </Screen>
  );
}
