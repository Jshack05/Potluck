import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PreviewProvider } from "@/features/splitfinder/state";
import { ClientProvider } from "@/services/client";
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  if (!loaded && !error) return null;
  return (
    <ClientProvider>
      <PreviewProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{ headerShown: false, animation: "slide_from_right" }}
        >
          <Stack.Screen name="circles" options={{ animation: "none" }} />
          <Stack.Screen name="cards" options={{ animation: "none" }} />
          <Stack.Screen name="bills" options={{ animation: "none" }} />
          <Stack.Screen name="discover" options={{ animation: "none" }} />
        </Stack>
      </PreviewProvider>
    </ClientProvider>
  );
}
