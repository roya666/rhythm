import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { useRhythmStore } from "@/lib/store";

export default function LocationScreen() {
  const router = useRouter();
  const setUserProfile = useRhythmStore((s) => s.setUserProfile);
  const setOnboardingComplete = useRhythmStore((s) => s.setOnboardingComplete);
  const [loading, setLoading] = useState(false);
  const [granted, setGranted] = useState(false);

  async function requestLocation() {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        setUserProfile({
          location: { lat: loc.coords.latitude, lng: loc.coords.longitude },
        });
        setGranted(true);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleFinish() {
    setOnboardingComplete(true);
    router.navigate("/(tabs)");
  }

  return (
    <View className="flex-1 bg-bg-primary items-center justify-center px-8">
      <Text className="text-text-muted text-sm uppercase tracking-widest mb-2">
        Step 3 of 3
      </Text>
      <Text className="text-text-primary text-2xl font-bold text-center mb-4">
        Location
      </Text>
      <Text className="text-text-muted text-base text-center mb-10">
        Your location helps Rhythm calculate seasonal daylight and energy
        patterns. This stays on your device.
      </Text>

      {!granted ? (
        <Pressable
          onPress={requestLocation}
          disabled={loading}
          className="bg-bg-surface px-8 py-4 rounded-xl active:opacity-80 w-full items-center mb-4"
        >
          {loading ? (
            <ActivityIndicator color="#F1EBEB" />
          ) : (
            <Text className="text-text-primary text-base font-medium">
              Allow Location Access
            </Text>
          )}
        </Pressable>
      ) : (
        <View className="bg-bg-surface px-8 py-4 rounded-xl w-full items-center mb-4">
          <Text className="text-score-high text-base font-medium">
            Location saved
          </Text>
        </View>
      )}

      <Pressable
        onPress={handleFinish}
        className="bg-accent-blood px-10 py-4 rounded-xl active:opacity-80 w-full items-center"
      >
        <Text className="text-text-primary text-base font-semibold">
          {granted ? "Finish" : "Skip & Finish"}
        </Text>
      </Pressable>
    </View>
  );
}
