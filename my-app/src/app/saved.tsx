import { router } from "expo-router";
import { listings } from "@/features/splitfinder/model";
import { usePreview } from "@/features/splitfinder/state";
import {
  Button,
  Heading,
  ListingCard,
  Note,
  Panel,
  Screen,
} from "@/features/splitfinder/ui";
export default function Saved() {
  const { saved } = usePreview();
  return (
    <Screen title="Saved listings">
      <Note>Keep a few plans in mind while you explore.</Note>
      {listings
        .filter((item) => saved.includes(item.id))
        .map((item) => (
          <ListingCard listing={item} key={item.id} />
        ))}
      {!saved.length && (
        <Panel>
          <Heading>No saved plans yet.</Heading>
          <Note>
            Open a listing and choose Save listing to keep it here during this
            session.
          </Note>
          <Button
            label="Explore listings"
            onPress={() => router.push("/discover")}
          />
        </Panel>
      )}
    </Screen>
  );
}
