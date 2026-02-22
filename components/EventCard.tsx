import { View, Text, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import type { CalendarEvent, RhythmScore } from "@/lib/types";
import { colors } from "@/lib/theme";
import { formatTime } from "@/lib/utils";

function getScoreColor(score: number): string {
  if (score >= 70) return colors.score.high;
  if (score >= 40) return colors.score.mid;
  return colors.score.low;
}

export function EventCard({
  event,
  score,
  onPress,
}: {
  event: CalendarEvent;
  score: RhythmScore;
  onPress: () => void;
}) {
  const tierColor = getScoreColor(score.overall);

  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  return (
    <Pressable onPress={handlePress} className="mx-4 mb-3">
      <View className="bg-bg-surface rounded-xl overflow-hidden flex-row">
        <View style={{ width: 4, backgroundColor: tierColor }} />
        <View className="flex-1 px-4 py-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-text-primary text-base font-medium flex-1 mr-2">
              {event.title}
            </Text>
            <View
              style={{ backgroundColor: tierColor }}
              className="rounded-full px-2.5 py-0.5"
            >
              <Text className="text-text-primary text-xs font-bold">
                {score.overall}
              </Text>
            </View>
          </View>
          <Text className="text-text-muted text-sm mt-1">
            {formatTime(event.startTime)} – {formatTime(event.endTime)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
