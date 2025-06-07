import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hide default header since we have custom ones
        animation: 'slide_from_right', // Smooth transitions between pages
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="draw" options={{ title: 'Draw' }} />
      <Stack.Screen name="result" options={{ title: 'Result' }} />
    </Stack>
  );
}