import { useState } from "react";
import { View, Text, ScrollView, SafeAreaView } from "react-native";
import { SegmentedControl } from "@/components/SegmentedControl";
import { WheelChart } from "@/components/WheelChart";
import { MonthCalendar } from "@/components/MonthCalendar";
import { WeekView } from "@/components/WeekView";

type ViewMode = "wheel" | "month" | "week";

const VIEW_OPTIONS: { key: ViewMode; label: string }[] = [
  { key: "wheel", label: "Wheel" },
  { key: "month", label: "Month" },
  { key: "week", label: "Week" },
];

export default function RhythmScreen() {
  const [view, setView] = useState<ViewMode>("wheel");

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <View className="pt-4 pb-2 px-4">
        <Text className="text-text-muted text-sm uppercase tracking-widest">
          Rhythm
        </Text>
      </View>
      <View className="mb-3">
        <SegmentedControl options={VIEW_OPTIONS} selected={view} onChange={setView} />
      </View>

      {view === "wheel" ? (
        <View className="flex-1 items-center justify-center">
          <WheelChart />
        </View>
      ) : view === "month" ? (
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
          <MonthCalendar />
        </ScrollView>
      ) : (
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
          <WeekView />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
