import { useEffect } from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { colors } from "@/lib/theme";

function getScoreColor(score: number): string {
  if (score >= 70) return colors.score.high;
  if (score >= 40) return colors.score.mid;
  return colors.score.low;
}

export function ScoreRing({
  score,
  size = 160,
}: {
  score: number;
  size?: number;
}) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score, 0), 100) / 100;
  const strokeDashoffset = circumference * (1 - progress);
  const center = size / 2;

  useEffect(() => {
    const style =
      score >= 70
        ? Haptics.ImpactFeedbackStyle.Light
        : score >= 40
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Heavy;
    Haptics.impactAsync(style);
  }, [score]);

  return (
    <View className="items-center my-4">
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#2A2A2A"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={getScoreColor(score)}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${center}, ${center}`}
          />
        </Svg>
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text className="text-text-primary text-4xl font-bold">
            {Math.round(score)}
          </Text>
          <Text className="text-text-muted text-xs">
            Your day's alignment
          </Text>
        </View>
      </View>
    </View>
  );
}
