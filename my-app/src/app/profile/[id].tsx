import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { findListing, listings } from "@/features/splitfinder/model";
import {
  Avatar,
  Button,
  Heading,
  ListingCard,
  Note,
  Panel,
  Screen,
} from "@/features/splitfinder/ui";
export default function Profile() {
  const { id, listingId } = useLocalSearchParams<{
    id: string;
    listingId?: string;
  }>();
  const posts = listings.filter((item) => item.hostId === id);
  const host = posts[0]?.host;
  if (!host)
    return (
      <Screen title="Profile">
        <Heading>Profile unavailable.</Heading>
        <Button
          label="Back to discovery"
          onPress={() => router.replace("/discover")}
        />
      </Screen>
    );
  const context = findListing(listingId ?? "");
  return (
    <Screen title="Profile">
      <View style={{ alignItems: "center", gap: 14, paddingVertical: 12 }}>
        <Avatar name={host} photo={id === "jordan"} size={128} />
        <Heading style={{ fontSize: 30 }}>{host}</Heading>
        <Note>Sample member profile</Note>
        <Note>
          {id === "jordan"
            ? "Weekend hiker and movie-night regular. Always up for a good shared plan."
            : "Looking for people to make a shared plan work together."}
        </Note>
      </View>
      <Panel>
        <Heading style={{ fontSize: 20 }}>Get to know each other</Heading>
        <Note>
          Ask about routines, timing, and what matters in a shared arrangement.
        </Note>
      </Panel>
      {context?.hostId === id && (
        <Button
          label={`Message ${host.split(" ")[0]} about this listing`}
          onPress={() =>
            router.push({
              pathname: "/inquiry/[id]",
              params: { id: context.id },
            })
          }
        />
      )}
      <Heading style={{ fontSize: 22 }}>Shared plans</Heading>
      {posts.filter((post) => post.category === "housing").length > 1 && (
        <Note>
          These homes are alternatives the poster is considering, not multiple
          commitments.
        </Note>
      )}
      {posts.map((post) => (
        <ListingCard key={post.id} listing={post} />
      ))}
    </Screen>
  );
}
