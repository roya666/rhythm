import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { useRhythmStore } from "@/lib/store";
import { PHASE_DEFS } from "@/lib/engine/menstrual";
import { phaseColors, phaseLabels } from "@/lib/theme";

function Toggle({
  value,
  onToggle,
}: {
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      className="w-14 h-8 rounded-full justify-center px-1"
      style={{ backgroundColor: value ? "#4A7C59" : "#2A2A2A" }}
    >
      <View
        className="w-6 h-6 rounded-full bg-white"
        style={{ alignSelf: value ? "flex-end" : "flex-start" }}
      />
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-text-muted text-xs uppercase tracking-widest mb-3 mt-6 px-1">
      {title}
    </Text>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const userProfile = useRhythmStore((s) => s.userProfile);
  const setUserProfile = useRhythmStore((s) => s.setUserProfile);
  const demoMode = useRhythmStore((s) => s.demoMode);
  const setDemoMode = useRhythmStore((s) => s.setDemoMode);
  const setOnboardingComplete = useRhythmStore((s) => s.setOnboardingComplete);

  const [cycleLength, setCycleLength] = useState(userProfile.cycleLength);
  const [lastPeriod, setLastPeriod] = useState(
    new Date(userProfile.lastPeriodStart + "T12:00:00")
  );

  function saveCycleSettings(length: number, date: Date) {
    setCycleLength(length);
    setLastPeriod(date);
    setUserProfile({
      cycleLength: length,
      lastPeriodStart: date.toISOString().split("T")[0],
    });
  }

  async function requestLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      const loc = await Location.getCurrentPositionAsync({});
      setUserProfile({
        location: { lat: loc.coords.latitude, lng: loc.coords.longitude },
      });
    }
  }

  function handleReset() {
    setOnboardingComplete(false);
    router.push("/onboarding");
  }

  return (
    <ScrollView className="flex-1 bg-bg-primary" contentContainerStyle={{ paddingBottom: 60 }}>
      <View className="px-5 pt-16">
        <Text className="text-text-primary text-2xl font-bold mb-2">
          Settings
        </Text>

        {/* Cycle Settings */}
        <SectionHeader title="Cycle Settings" />
        <View className="bg-bg-surface rounded-xl p-4">
          <Text className="text-text-muted text-sm mb-3">
            Cycle Length (days)
          </Text>
          <View className="flex-row items-center justify-center mb-5">
            <Pressable
              onPress={() => {
                const next = Math.max(21, cycleLength - 1);
                saveCycleSettings(next, lastPeriod);
              }}
              className="w-10 h-10 rounded-full bg-bg-elevated items-center justify-center active:opacity-80"
            >
              <Text className="text-text-primary text-xl font-bold">−</Text>
            </Pressable>
            <Text className="text-text-primary text-3xl font-bold mx-6 w-12 text-center">
              {cycleLength}
            </Text>
            <Pressable
              onPress={() => {
                const next = Math.min(35, cycleLength + 1);
                saveCycleSettings(next, lastPeriod);
              }}
              className="w-10 h-10 rounded-full bg-bg-elevated items-center justify-center active:opacity-80"
            >
              <Text className="text-text-primary text-xl font-bold">+</Text>
            </Pressable>
          </View>

          <Text className="text-text-muted text-sm mb-2">
            Last Period Start
          </Text>
          <DateTimePicker
            value={lastPeriod}
            mode="date"
            display="spinner"
            maximumDate={new Date()}
            themeVariant="dark"
            onChange={(_e, date) => {
              if (date) saveCycleSettings(cycleLength, date);
            }}
          />
        </View>

        {/* Data */}
        <SectionHeader title="Data" />
        <View className="bg-bg-surface rounded-xl p-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-text-primary text-base">Demo mode</Text>
            <Toggle value={demoMode} onToggle={() => setDemoMode(!demoMode)} />
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <Text className="text-text-primary text-base">Location</Text>
              {userProfile.location ? (
                <Text className="text-text-muted text-xs mt-1">
                  {userProfile.location.lat.toFixed(2)},{" "}
                  {userProfile.location.lng.toFixed(2)}
                </Text>
              ) : (
                <Text className="text-text-muted text-xs mt-1">Not set</Text>
              )}
            </View>
            <Pressable
              onPress={requestLocation}
              className="bg-bg-elevated px-4 py-2 rounded-lg active:opacity-80"
            >
              <Text className="text-text-primary text-sm">
                {userProfile.location ? "Update" : "Allow"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Phase Reference */}
        <SectionHeader title="Phase Reference" />
        {PHASE_DEFS.map((def) => (
          <View
            key={def.phase}
            className="bg-bg-surface rounded-xl p-4 mb-3 flex-row"
          >
            <View
              style={{
                width: 4,
                backgroundColor: phaseColors[def.phase],
                borderRadius: 2,
                marginRight: 12,
              }}
            />
            <View className="flex-1">
              <Text className="text-text-primary text-base font-medium">
                {phaseLabels[def.phase]}
              </Text>
              <Text className="text-text-muted text-sm mt-1">
                {def.description}
              </Text>
              <Text className="text-text-muted text-xs mt-1">
                Energy: {def.energyLevel}/100 · Focus: {def.focusType}
              </Text>
            </View>
          </View>
        ))}

        {/* Reset */}
        <SectionHeader title="Reset" />
        <Pressable
          onPress={handleReset}
          className="bg-bg-surface rounded-xl py-4 items-center active:opacity-80"
        >
          <Text className="text-accent-wine text-base font-medium">
            Re-launch Onboarding
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
