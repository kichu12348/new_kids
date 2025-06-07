import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ModelProvider } from "../contexts/modelContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView>
      {/* SafeAreaProvider ensures that the app respects safe areas on devices */}
      <SafeAreaProvider>
        <ModelProvider>
          <Stack
            screenOptions={{
              headerShown: false, // Hide default header since we have custom ones
              animation: "slide_from_right", // Smooth transitions between pages
            }}
          >
            <Stack.Screen name="index" options={{ title: "Home" }} />
            <Stack.Screen name="draw" options={{ title: "Draw" }} />
            <Stack.Screen name="result" options={{ title: "Result" }} />
          </Stack>
        </ModelProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
