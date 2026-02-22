import { useEffect } from "react";
import { View, Text, Modal, Pressable, Platform, Linking } from "react-native";
import * as Haptics from "expo-haptics";
import type { CalendarEvent, RhythmScore } from "@/lib/types";
import { colors } from "@/lib/theme";
import { formatDate } from "@/lib/utils";

type Suggestion = {
  suggestedDate: string;
  score: number;
  reasoning: string;
} | null;

function getScoreColor(score: number): string {
  if (score >= 70) return colors.score.high;
  if (score >= 40) return colors.score.mid;
  return colors.score.low;
}

function AlignmentBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const barColor =
    value >= 70 ? colors.score.high : value >= 40 ? colors.score.mid : colors.score.low;

  return (
    <View className="mb-3">
      <View className="flex-row justify-between mb-1">
        <Text className="text-text-muted text-sm">{label}</Text>
        <Text className="text-text-primary text-sm font-medium">{value}</Text>
      </View>
      <View className="h-2 rounded-full bg-bg-elevated">
        <View
          style={{
            width: `${Math.min(value, 100)}%`,
            backgroundColor: barColor,
          }}
          className="h-2 rounded-full"
        />
      </View>
    </View>
  );
}

function ScoreCircle({ score, label }: { score: number; label: string }) {
  return (
    <View className="items-center">
      <View
        style={{ backgroundColor: getScoreColor(score) }}
        className="w-14 h-14 rounded-full items-center justify-center"
      >
        <Text className="text-text-primary text-lg font-bold">{score}</Text>
      </View>
      <Text className="text-text-muted text-xs mt-1">{label}</Text>
    </View>
  );
}

function openNativeCalendar() {
  if (Platform.OS === "ios") {
    Linking.openURL("calshow:");
  } else {
    Linking.openURL("content://com.android.calendar/time/");
  }
}

export function AlignmentSheet({
  visible,
  onClose,
  event,
  score,
  suggestion,
}: {
  visible: boolean;
  onClose: () => void;
  event: CalendarEvent;
  score: RhythmScore;
  suggestion: Suggestion;
}) {
  const eventDate = event.startTime.split("T")[0];

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="bg-bg-surface rounded-t-3xl px-5 pt-5 pb-8"
        >
          <View className="w-10 h-1 bg-bg-elevated rounded-full self-center mb-4" />
          <Text className="text-text-primary text-xl font-bold mb-4">
            {event.title}
          </Text>

          <AlignmentBar label="Cycle Alignment" value={score.cycleAlignment} />
          <AlignmentBar label="Lunar Alignment" value={score.lunarAlignment} />
          <AlignmentBar label="Seasonal Alignment" value={score.seasonalAlignment} />

          <View className="flex-row items-center justify-between mt-2 mb-3">
            <Text className="text-text-muted text-sm">Overall Score</Text>
            <Text className="text-text-primary text-lg font-bold">
              {score.overall}
            </Text>
          </View>

          {suggestion && (
            <View className="bg-bg-elevated rounded-xl p-4 mt-2">
              <View className="flex-row items-center justify-center mb-3">
                <ScoreCircle score={score.overall} label={formatDate(eventDate)} />
                <Text className="text-text-muted text-lg mx-4">→</Text>
                <ScoreCircle
                  score={suggestion.score}
                  label={formatDate(suggestion.suggestedDate)}
                />
              </View>
              <Text className="text-text-muted text-sm">
                {suggestion.reasoning}
              </Text>
              <Pressable
                onPress={openNativeCalendar}
                style={{ backgroundColor: colors.score.mid }}
                className="rounded-xl py-3 mt-3 items-center"
              >
                <Text className="text-bg-primary text-base font-medium">
                  Reschedule
                </Text>
              </Pressable>
            </View>
          )}

          <Pressable
            onPress={onClose}
            className="bg-bg-elevated rounded-xl py-3 mt-4 items-center"
          >
            <Text className="text-text-primary text-base font-medium">
              Close
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
