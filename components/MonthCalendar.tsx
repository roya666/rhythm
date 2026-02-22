import { useState, useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { useRhythmStore } from "@/lib/store";
import { getCurrentPhase } from "@/lib/engine/menstrual";
import { getLunarPhase } from "@/lib/engine/lunar";
import { scoreEvent } from "@/lib/engine/score";
import { phaseColors, colors } from "@/lib/theme";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getScoreColor(score: number): string {
  if (score >= 70) return colors.score.high;
  if (score >= 40) return colors.score.mid;
  return colors.score.low;
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function MonthCalendar() {
  const userProfile = useRhythmStore((s) => s.userProfile);
  const events = useRhythmStore((s) => s.events);

  const now = new Date();
  const [viewMonth, setViewMonth] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });

  const today = now.toISOString().split("T")[0];

  const grid = useMemo(() => {
    const { year, month } = viewMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Monday = 0, Sunday = 6
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const cells: {
      date: string;
      day: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      phase: ReturnType<typeof getCurrentPhase>;
      eventScores: number[];
    }[] = [];

    // Previous month overflow
    const prevLastDay = new Date(year, month, 0).getDate();
    for (let i = startDow - 1; i >= 0; i--) {
      const d = prevLastDay - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const iso = toIso(prevYear, prevMonth, d);
      const phase = getCurrentPhase(userProfile.lastPeriodStart, userProfile.cycleLength, iso);
      const dayEvents = events.filter((e) => e.startTime.startsWith(iso));
      const eventScores = dayEvents.map((e) => scoreEvent(e, iso, userProfile).overall);
      cells.push({ date: iso, day: d, isCurrentMonth: false, isToday: iso === today, phase, eventScores });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = toIso(year, month, d);
      const phase = getCurrentPhase(userProfile.lastPeriodStart, userProfile.cycleLength, iso);
      const dayEvents = events.filter((e) => e.startTime.startsWith(iso));
      const eventScores = dayEvents.map((e) => scoreEvent(e, iso, userProfile).overall);
      cells.push({ date: iso, day: d, isCurrentMonth: true, isToday: iso === today, phase, eventScores });
    }

    // Next month overflow to fill grid
    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      for (let d = 1; d <= remaining; d++) {
        const iso = toIso(nextYear, nextMonth, d);
        const phase = getCurrentPhase(userProfile.lastPeriodStart, userProfile.cycleLength, iso);
        const dayEvents = events.filter((e) => e.startTime.startsWith(iso));
        const eventScores = dayEvents.map((e) => scoreEvent(e, iso, userProfile).overall);
        cells.push({ date: iso, day: d, isCurrentMonth: false, isToday: iso === today, phase, eventScores });
      }
    }

    return cells;
  }, [viewMonth, userProfile, events, today]);

  // Monthly summary
  const summary = useMemo(() => {
    const currentMonthCells = grid.filter((c) => c.isCurrentMonth);
    const allScores = currentMonthCells.flatMap((c) => c.eventScores);
    const avg = allScores.length > 0
      ? Math.round(allScores.reduce((s, v) => s + v, 0) / allScores.length)
      : 0;
    return { avg, totalEvents: allScores.length };
  }, [grid]);

  function navigate(delta: number) {
    setViewMonth((prev) => {
      let m = prev.month + delta;
      let y = prev.year;
      if (m < 0) { m = 11; y--; }
      if (m > 11) { m = 0; y++; }
      return { year: y, month: m };
    });
  }

  return (
    <View className="flex-1 px-4">
      {/* Month header with navigation */}
      <View className="flex-row items-center justify-between py-3">
        <Pressable onPress={() => navigate(-1)} hitSlop={12}>
          <Text className="text-text-muted text-lg px-2">{"\u2039"}</Text>
        </Pressable>
        <Text className="text-text-primary text-base font-semibold">
          {MONTH_NAMES[viewMonth.month]} {viewMonth.year}
        </Text>
        <Pressable onPress={() => navigate(1)} hitSlop={12}>
          <Text className="text-text-muted text-lg px-2">{"\u203A"}</Text>
        </Pressable>
      </View>

      {/* Day-of-week labels */}
      <View className="flex-row mb-1">
        {DAY_LABELS.map((label) => (
          <View key={label} className="flex-1 items-center">
            <Text className="text-text-muted text-xs">{label}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View>
        {Array.from({ length: grid.length / 7 }, (_, row) => (
          <View key={row} className="flex-row">
            {grid.slice(row * 7, row * 7 + 7).map((cell) => (
              <View
                key={cell.date}
                className="flex-1 items-center justify-center rounded-xl my-0.5 mx-0.5"
                style={{
                  height: 48,
                  backgroundColor: phaseColors[cell.phase.phase] + "26", // ~15% opacity
                }}
              >
                {/* Today indicator */}
                {cell.isToday && (
                  <View
                    style={{
                      position: "absolute",
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: phaseColors[cell.phase.phase],
                      top: 4,
                    }}
                  />
                )}
                <Text
                  className={`text-xs font-medium ${
                    cell.isCurrentMonth ? "text-text-primary" : "text-text-muted"
                  }`}
                  style={{ zIndex: 1 }}
                >
                  {cell.day}
                </Text>

                {/* Event dots (up to 3) */}
                {cell.eventScores.length > 0 && (
                  <View className="flex-row mt-0.5" style={{ gap: 2 }}>
                    {cell.eventScores.slice(0, 3).map((score, i) => (
                      <View
                        key={i}
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: getScoreColor(score),
                        }}
                      />
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* Monthly summary */}
      <View className="mt-4 bg-bg-surface rounded-xl px-4 py-3 flex-row items-center justify-between">
        <View>
          <Text className="text-text-muted text-sm">Monthly Average</Text>
          <Text className="text-text-muted text-xs">{summary.totalEvents} events</Text>
        </View>
        <Text className="text-text-primary text-2xl font-bold">{summary.avg}</Text>
      </View>
    </View>
  );
}
