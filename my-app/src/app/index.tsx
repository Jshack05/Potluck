import { Redirect, useLocalSearchParams } from "expo-router";
import Welcome from "@/features/splitfinder/welcome";
import { useClient } from "@/services/client";
export default function Entry() {
  const { user, ready } = useClient();
  const { change } = useLocalSearchParams();
  if (!ready) return null;
  return user && change !== "1" ? <Redirect href="/circles" /> : <Welcome />;
}
