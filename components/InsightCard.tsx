import { View, Text } from "react-native";
import type { DailyInsight } from "@/lib/types";

const TYPE_LABELS: Record<DailyInsight["type"], string> = {
  cycle: "CYCLE",
  lunar: "LUNAR",
  seasonal: "SEASON",
};

export function InsightCard({
  insight,
  phaseColor,
}: {
  insight: DailyInsight;
  phaseColor: string;
}) {
  return (
    <View className="mx-4 mt-3 rounded-xl overflow-hidden">
      <View
        style={{
          backgroundColor: phaseColor,
          opacity: 0.1,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      <View className="px-4 py-3">
        <View className="flex-row items-center mb-1">
          <Text className="text-base mr-2">{insight.icon}</Text>
          <Text className="text-text-primary text-base font-bold flex-1">
            {insight.title}
          </Text>
          <View className="bg-bg-elevated rounded-full px-2 py-0.5">
            <Text className="text-text-muted text-xs font-medium">
              {TYPE_LABELS[insight.type]}
            </Text>
          </View>
        </View>
        <Text className="text-text-primary text-sm opacity-80">
          {insight.message}
        </Text>
      </View>
    </View>
  );
}
