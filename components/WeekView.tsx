import { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRhythmStore } from "@/lib/store";
import { getCurrentPhase } from "@/lib/engine/menstrual";
import { getLunarPhase } from "@/lib/engine/lunar";
import { scoreEvent } from "@/lib/engine/score";
import { addDays } from "@/lib/utils";
import { phaseColors, colors } from "@/lib/theme";
import { MoonIcon } from "@/components/MoonIcon";

function getScoreColor(score: number): string {
  if (score >= 70) return colors.score.high;
  if (score >= 40) return colors.score.mid;
  return colors.score.low;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMondayOfWeek(iso: string): string {
  const d = new Date(iso);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

export function WeekView() {
  const userProfile = useRhythmStore((s) => s.userProfile);
  const events = useRhythmStore((s) => s.events);

  const today = new Date().toISOString().split("T")[0];
  const monday = getMondayOfWeek(today);

  const weekData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(monday, i);
      const phase = getCurrentPhase(
        userProfile.lastPeriodStart,
        userProfile.cycleLength,
        date
      );
      const lunar = getLunarPhase(date);
      const dayEvents = events.filter((e) => e.startTime.startsWith(date));
      const scored = dayEvents.map((event) => ({
        event,
        score: scoreEvent(event, date, userProfile),
      }));
      return { date, phase, lunar, scored, isToday: date === today };
    });
  }, [monday, userProfile, events, today]);

  const weeklyAvg = useMemo(() => {
    const all = weekData.flatMap((d) => d.scored);
    if (all.length === 0) return 0;
    return Math.round(all.reduce((s, e) => s + e.score.overall, 0) / all.length);
  }, [weekData]);

  return (
    <View className="flex-1">
      {/* Phase gradient band */}
      <View className="flex-row mx-4 rounded-lg overflow-hidden mb-1">
        {weekData.map((day) => (
          <View
            key={day.date}
            style={{ backgroundColor: phaseColors[day.phase.phase] }}
            className="flex-1 h-3"
          />
        ))}
      </View>

      {/* Lunar row */}
      <View className="flex-row mx-4 mb-4">
        {weekData.map((day) => (
          <View key={day.date} className="flex-1 items-center py-1">
            <MoonIcon phase={day.lunar.phase} size={16} />
          </View>
        ))}
      </View>

      {/* Day columns */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-2">
        {weekData.map((day, i) => (
          <View
            key={day.date}
            className="mx-1.5 items-center"
            style={{ width: 80 }}
          >
            <Text
              className={`text-xs font-medium mb-0.5 ${
                day.isToday ? "text-text-primary" : "text-text-muted"
              }`}
            >
              {DAY_LABELS[i]}
            </Text>
            <Text
              className={`text-sm font-bold mb-2 ${
                day.isToday ? "text-text-primary" : "text-text-muted"
              }`}
            >
              {new Date(day.date + "T12:00:00").getDate()}
            </Text>

            {day.scored.length === 0 ? (
              <View className="bg-bg-surface rounded-lg w-full py-3 items-center">
                <Text className="text-text-muted text-xs">--</Text>
              </View>
            ) : (
              day.scored.map(({ event, score }) => (
                <View
                  key={event.id}
                  style={{ backgroundColor: getScoreColor(score.overall) }}
                  className="rounded-lg w-full py-2 px-1.5 mb-1.5 items-center"
                >
                  <Text
                    className="text-text-primary text-xs font-medium"
                    numberOfLines={1}
                  >
                    {event.title}
                  </Text>
                  <Text className="text-text-primary text-xs opacity-70">
                    {score.overall}
                  </Text>
                </View>
              ))
            )}
          </View>
        ))}
      </ScrollView>

      {/* Weekly summary */}
      <View className="mx-4 mt-6 bg-bg-surface rounded-xl px-4 py-3 flex-row items-center justify-between">
        <Text className="text-text-muted text-sm">Weekly Average</Text>
        <Text className="text-text-primary text-2xl font-bold">{weeklyAvg}</Text>
      </View>
    </View>
  );
}
