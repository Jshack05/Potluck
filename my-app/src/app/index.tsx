import { Redirect, useLocalSearchParams, type Href } from "expo-router";
import Welcome from "@/features/splitfinder/welcome";
import { useClient } from "@/services/client";
import { entryDestination } from "@/services/navigation";
import { EntryLoading } from "@/design/system";
export default function Entry() {
  const { access, ready } = useClient();
  const { change } = useLocalSearchParams();
  if (!ready) return <EntryLoading />;
  const destination = entryDestination(access, "/circles");
  if (destination) return <Redirect href={destination as Href} />;
  return change === "1" ? <Welcome /> : <Redirect href="/circles" />;
}
