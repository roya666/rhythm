import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRhythmStore } from "@/lib/store";
import { addDays } from "@/lib/utils";

export default function CycleInputScreen() {
  const router = useRouter();
  const userProfile = useRhythmStore((s) => s.userProfile);
  const setUserProfile = useRhythmStore((s) => s.setUserProfile);

  const [cycleLength, setCycleLength] = useState(userProfile.cycleLength);
  const [lastPeriod, setLastPeriod] = useState(
    new Date(userProfile.lastPeriodStart + "T12:00:00")
  );

  function handleNext() {
    setUserProfile({
      cycleLength,
      lastPeriodStart: lastPeriod.toISOString().split("T")[0],
    });
    router.push("/onboarding/calendar");
  }

  function handleSkip() {
    const today = new Date().toISOString().split("T")[0];
    setUserProfile({
      cycleLength: 28,
      lastPeriodStart: addDays(today, -14),
    });
    router.push("/onboarding/calendar");
  }

  return (
    <View className="flex-1 bg-bg-primary items-center justify-center px-8">
      <Text className="text-text-muted text-sm uppercase tracking-widest mb-2">
        Step 1 of 3
      </Text>
      <Text className="text-text-primary text-2xl font-bold text-center mb-8">
        Your Cycle
      </Text>

      {/* Cycle length stepper */}
      <Text className="text-text-muted text-sm mb-3">Cycle Length (days)</Text>
      <View className="flex-row items-center mb-8">
        <Pressable
          onPress={() => setCycleLength((l) => Math.max(21, l - 1))}
          className="w-12 h-12 rounded-full bg-bg-elevated items-center justify-center active:opacity-80"
        >
          <Text className="text-text-primary text-2xl font-bold">−</Text>
        </Pressable>
        <Text className="text-text-primary text-4xl font-bold mx-8 w-16 text-center">
          {cycleLength}
        </Text>
        <Pressable
          onPress={() => setCycleLength((l) => Math.min(35, l + 1))}
          className="w-12 h-12 rounded-full bg-bg-elevated items-center justify-center active:opacity-80"
        >
          <Text className="text-text-primary text-2xl font-bold">+</Text>
        </Pressable>
      </View>

      {/* Last period date picker */}
      <Text className="text-text-muted text-sm mb-3">Last Period Start</Text>
      <View className="bg-bg-surface rounded-xl overflow-hidden mb-8">
        <DateTimePicker
          value={lastPeriod}
          mode="date"
          display="spinner"
          maximumDate={new Date()}
          themeVariant="dark"
          onChange={(_e, date) => date && setLastPeriod(date)}
        />
      </View>

      <Pressable
        onPress={handleNext}
        className="bg-accent-blood px-10 py-4 rounded-xl active:opacity-80 w-full items-center"
      >
        <Text className="text-text-primary text-base font-semibold">Next</Text>
      </Pressable>

      <Pressable onPress={handleSkip} className="mt-4 py-2">
        <Text className="text-text-muted text-sm">
          I don't track a cycle — skip
        </Text>
      </Pressable>
    </View>
  );
}
