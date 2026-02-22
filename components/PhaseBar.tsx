import { View, Text } from "react-native";
import type { PhaseInfo, LunarInfo } from "@/lib/types";
import { phaseColors, phaseLabels } from "@/lib/theme";
import { MoonIcon } from "./MoonIcon";

export function PhaseBar({
  phase,
  lunarPhase,
}: {
  phase: PhaseInfo;
  lunarPhase: LunarInfo;
}) {
  const bgColor = phaseColors[phase.phase];

  return (
    <View className="mx-4 rounded-xl overflow-hidden">
      <View
        style={{ backgroundColor: bgColor, opacity: 0.15, position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View className="px-4 py-4">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-text-primary text-xl font-bold">
            {phaseLabels[phase.phase]}
          </Text>
          <MoonIcon phase={lunarPhase.phase} size={22} />
        </View>
        <Text className="text-text-muted text-sm mb-1">
          Day {phase.dayInPhase} of {phase.totalDaysInPhase}
        </Text>
        <Text className="text-text-primary text-sm opacity-80">
          {phase.description}
        </Text>
      </View>
    </View>
  );
}
