import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PreviewProvider } from "@/features/splitfinder/state";

export default function RootLayout() {
  return (
    <PreviewProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{ headerShown: false, animation: "slide_from_right" }}
      />
    </PreviewProvider>
  );
}
