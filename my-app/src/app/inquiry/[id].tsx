import { router, useLocalSearchParams } from "expo-router";
import { useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { findListing } from "@/features/splitfinder/model";
import { usePreview } from "@/features/splitfinder/state";
import {
  Avatar,
  Button,
  colors,
  Heading,
  MissingListing,
  Note,
  Panel,
  Screen,
  s,
  Txt,
} from "@/features/splitfinder/ui";
export default function Inquiry() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const state = usePreview();
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);
  const listing = findListing(id);
  if (!listing) return <MissingListing />;
  const draft = state.drafts[id] ?? "";
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Screen title="Inquiry" scroll={false}>
        <ScrollView
          ref={scroll}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={s.content}
          onContentSizeChange={() =>
            scroll.current?.scrollToEnd({ animated: true })
          }
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View ${listing.host}'s profile`}
            onPress={() =>
              router.push({
                pathname: "/profile/[id]",
                params: { id: listing.hostId, listingId: id },
              })
            }
          >
            <Panel style={s.row}>
              <Avatar name={listing.host} photo={listing.hostId === "jordan"} />
              <View>
                <Heading style={{ fontSize: 18, lineHeight: 25 }}>
                  {listing.host}
                </Heading>
                <Note>Host · Sample profile</Note>
              </View>
            </Panel>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View listing"
            onPress={() =>
              router.push({ pathname: "/listing/[id]", params: { id } })
            }
          >
            <Panel>
              <Heading style={{ fontSize: 18, lineHeight: 25 }}>
                {listing.title}
              </Heading>
              <Note>View listing and proposed share</Note>
            </Panel>
          </Pressable>
          <Note>
            Try a conversation here. Messages stay in this app session and
            aren’t delivered.
          </Note>
          {!state.messages[id]?.length && (
            <Panel>
              <Heading style={{ fontSize: 20 }}>Start with a hello.</Heading>
              <Note>
                Ask about availability, timing, or what the host has in mind.
              </Note>
              <Button
                label="Use a suggested introduction"
                secondary
                onPress={() =>
                  state.draft(
                    id,
                    "Hi! I’m interested in sharing. Could you tell me more about the plan and the next steps?",
                  )
                }
              />
            </Panel>
          )}
          {(state.messages[id] ?? []).map((text, index) => (
            <Panel
              key={index}
              style={{ backgroundColor: colors.pale, marginLeft: 20 }}
            >
              <Txt
                style={{ color: colors.blue, fontWeight: "600", fontSize: 13 }}
              >
                You · Practice message
              </Txt>
              <Txt selectable>{text}</Txt>
            </Panel>
          ))}
        </ScrollView>
        <View
          style={[s.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}
        >
          <TextInput
            accessibilityLabel="Message to host"
            multiline
            maxLength={2000}
            value={draft}
            onChangeText={(value) => state.draft(id, value)}
            placeholder="Write a message…"
            placeholderTextColor={colors.secondary}
            style={[s.input, { maxHeight: 120, minHeight: 60 }]}
          />
          <Button
            label="Add practice message"
            disabled={!draft.trim()}
            onPress={() => state.send(id)}
          />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
