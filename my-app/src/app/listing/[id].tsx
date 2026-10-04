import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, View } from "react-native";
import {
  findListing,
  money,
  categoryLabels,
} from "@/features/splitfinder/model";
import { usePreview } from "@/features/splitfinder/state";
import {
  artwork,
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
export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const listing = findListing(id);
  const state = usePreview();
  if (!listing) return <MissingListing />;
  return (
    <Screen
      title="Splitfinder"
      footer={
        <Button
          label="Message host"
          onPress={() =>
            router.push({ pathname: "/inquiry/[id]", params: { id } })
          }
        />
      }
    >
      <Image
        source={artwork[listing.image]}
        contentFit={listing.image === "service" ? "contain" : "cover"}
        style={{
          width: "100%",
          height: listing.image === "service" ? 64 : 215,
          borderRadius: 24,
        }}
        accessibilityLabel={
          listing.image === "service" ? "Service icon" : "Sample listing photo"
        }
      />
      <View style={{ gap: 8 }}>
        <Txt style={{ color: colors.blue, fontWeight: "600" }}>
          {listing.status ?? "Planning together"} ·{" "}
          {categoryLabels[listing.category]}
        </Txt>
        <Heading>{listing.title}</Heading>
        {listing.location ? (
          <Note>{listing.location} · Approximate location</Note>
        ) : null}
      </View>
      <Panel>
        <Heading style={{ fontSize: 32, color: colors.blue }}>
          {money(listing.shareMinor)}
        </Heading>
        <Note>Estimated per person / month</Note>
        {listing.totalMinor && (
          <Note>
            {money(listing.totalMinor)} total monthly{" "}
            {listing.category === "housing" ? "rent" : "plan"}
          </Note>
        )}
        <Note>
          Sample estimate supplied with this listing. Discuss the actual terms
          with the host.
        </Note>
      </Panel>
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
          <View style={{ flex: 1 }}>
            <Heading style={{ fontSize: 18, lineHeight: 25 }}>
              {listing.host}
            </Heading>
            <Note>View host profile</Note>
          </View>
        </Panel>
      </Pressable>
      <Panel>
        <Heading style={{ fontSize: 20 }}>About this plan</Heading>
        <Txt>{listing.description}</Txt>
        <Note>{listing.facts}</Note>
        {listing.moveIn && <Note>Move in {listing.moveIn}</Note>}
        <Txt style={{ fontWeight: "600" }}>{listing.availability}</Txt>
      </Panel>
      <Button
        label={
          state.saved.includes(id) ? "Saved · Remove listing" : "Save listing"
        }
        secondary
        onPress={() => state.save(id)}
      />
      <Note>
        A conversation is an introduction, not an agreement to join, rent, or
        pay.
      </Note>
    </Screen>
  );
}
