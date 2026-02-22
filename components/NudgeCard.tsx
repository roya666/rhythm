import { View, Text, Pressable } from "react-native";
import type { CalendarEvent, RhythmScore, CyclePhase } from "@/lib/types";
import { colors } from "@/lib/theme";

function getEnergyLabel(demand: CalendarEvent["energyDemand"]): string {
  if (demand === "high") return "high";
  if (demand === "medium") return "moderate";
  return "low";
}

export function NudgeCard({
  event,
  score,
  phaseName,
  onViewSuggestion,
}: {
  event: CalendarEvent;
  score: RhythmScore;
  phaseName: string;
  onViewSuggestion: () => void;
}) {
  return (
    <View className="mx-4 mb-3">
      <View className="bg-bg-surface rounded-xl overflow-hidden flex-row">
        <View style={{ width: 4, backgroundColor: colors.score.low }} />
        <View className="flex-1 px-4 py-3">
          <View className="flex-row items-center mb-2">
            <View
              style={{ backgroundColor: colors.score.low }}
              className="w-6 h-6 rounded-full items-center justify-center mr-3"
            >
              <Text className="text-text-primary text-xs font-bold">!</Text>
            </View>
            <Text className="text-text-primary text-base font-medium flex-1 mr-2">
              {event.title}
            </Text>
            <View
              style={{ backgroundColor: colors.score.low }}
              className="rounded-full px-2.5 py-0.5"
            >
              <Text className="text-text-primary text-xs font-bold">
                {score.overall}
              </Text>
            </View>
          </View>
          <Text className="text-text-muted text-sm mb-3">
            This {getEnergyLabel(event.energyDemand)}-energy event falls during
            your {phaseName} phase.
          </Text>
          <Pressable onPress={onViewSuggestion}>
            <Text style={{ color: colors.score.mid }} className="text-sm font-medium">
              View suggestion
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
