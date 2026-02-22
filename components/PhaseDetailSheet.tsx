import { useEffect } from "react";
import { View, Text, Modal, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { PHASE_DEFS } from "@/lib/engine/menstrual";
import { phaseColors, phaseLabels, colors } from "@/lib/theme";
import type { CyclePhase } from "@/lib/types";

function EnergyBar({ value }: { value: number }) {
  const barColor =
    value >= 70 ? colors.score.high : value >= 40 ? colors.score.mid : colors.score.low;

  return (
    <View className="mb-3">
      <View className="flex-row justify-between mb-1">
        <Text className="text-text-muted text-sm">Energy Level</Text>
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

export function PhaseDetailSheet({
  visible,
  onClose,
  phase,
  currentDay,
  totalDays,
}: {
  visible: boolean;
  onClose: () => void;
  phase: CyclePhase | null;
  currentDay: number | null;
  totalDays: number | null;
}) {
  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [visible]);

  if (!phase) return null;

  const def = PHASE_DEFS.find((d) => d.phase === phase);
  if (!def) return null;

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

          {/* Phase color header bar */}
          <View
            style={{ backgroundColor: phaseColors[phase], height: 4, borderRadius: 2 }}
            className="mb-4"
          />

          <Text className="text-text-primary text-xl font-bold mb-1">
            {phaseLabels[phase]}
          </Text>

          {currentDay != null && totalDays != null && (
            <Text className="text-text-muted text-sm mb-4">
              You are on day {currentDay} of {totalDays}
            </Text>
          )}

          <EnergyBar value={def.energyLevel} />

          <View className="flex-row items-center mb-3 mt-1">
            <View
              style={{ backgroundColor: colors.bg.elevated }}
              className="rounded-full px-3 py-1"
            >
              <Text className="text-text-primary text-xs font-medium uppercase">
                Best for: {def.focusType}
              </Text>
            </View>
          </View>

          <Text className="text-text-muted text-sm leading-5 mb-4">
            {def.description}
          </Text>

          <Pressable
            onPress={onClose}
            className="bg-bg-elevated rounded-xl py-3 items-center"
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
