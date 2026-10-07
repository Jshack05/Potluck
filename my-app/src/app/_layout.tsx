import { Stack, usePathname } from "expo-router";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { PreviewProvider } from "@/features/splitfinder/state";
import { ClientProvider, useClient } from "@/services/client";
import { BottomNavigation, mainTab } from "@/design/chrome";
import { theme } from "@/design/primitives";
import { entryDestination } from "@/services/navigation";
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
        <AppNavigator />
      </PreviewProvider>
    </ClientProvider>
  );
}

function AppNavigator() {
  const pathname = usePathname();
  const tab = mainTab(pathname);
  const client = useClient();
  const showNavigation =
    tab && client.ready && !entryDestination(client.access, pathname);
  return (
    <View
      style={{
        flex: 1,
        backgroundColor:
          tab === "Splitfinder" ? theme.blueCanvas : theme.canvas,
      }}
    >
      <Stack
        screenOptions={{ headerShown: false, animation: "slide_from_right" }}
      >
        <Stack.Screen name="circles" options={{ animation: "none" }} />
        <Stack.Screen name="cards" options={{ animation: "none" }} />
        <Stack.Screen name="bills" options={{ animation: "none" }} />
        <Stack.Screen name="discover" options={{ animation: "none" }} />
      </Stack>
      {showNavigation && <BottomNavigation selected={tab} />}
    </View>
  );
}
