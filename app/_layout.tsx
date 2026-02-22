import { Stack, Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { useRhythmStore } from "@/lib/store";
import "../global.css";

export default function RootLayout() {
  const hasHydrated = useRhythmStore((s) => s._hasHydrated);
  const onboardingComplete = useRhythmStore((s) => s.onboardingComplete);

  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0A0A0A", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#891D1A" size="large" />
      </View>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0A0A0A" },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="onboarding"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
      </Stack>
      {!onboardingComplete && <Redirect href="/onboarding" />}
      <StatusBar style="light" />
    </>
  );
}
