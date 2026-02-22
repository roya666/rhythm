import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useRhythmStore } from "@/lib/store";

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

export default function CalendarConnectScreen() {
  const router = useRouter();
  const demoMode = useRhythmStore((s) => s.demoMode);
  const setDemoMode = useRhythmStore((s) => s.setDemoMode);

  return (
    <View className="flex-1 bg-bg-primary items-center justify-center px-8">
      <Text className="text-text-muted text-sm uppercase tracking-widest mb-2">
        Step 2 of 3
      </Text>
      <Text className="text-text-primary text-2xl font-bold text-center mb-4">
        Demo Data
      </Text>
      <Text className="text-text-muted text-base text-center mb-10">
        Load sample calendar events so you can explore Rhythm right away. You
        can turn this off later in Settings.
      </Text>

      <View className="bg-bg-surface rounded-xl px-5 py-4 flex-row items-center justify-between w-full mb-10">
        <Text className="text-text-primary text-base font-medium">
          Use demo events
        </Text>
        <Toggle
          value={demoMode}
          onToggle={() => setDemoMode(!demoMode)}
        />
      </View>

      <Pressable
        onPress={() => router.push("/onboarding/location")}
        className="bg-accent-blood px-10 py-4 rounded-xl active:opacity-80 w-full items-center"
      >
        <Text className="text-text-primary text-base font-semibold">Next</Text>
      </Pressable>
    </View>
  );
}
