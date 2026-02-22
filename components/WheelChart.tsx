import { useMemo } from "react";
import { View, Text, useWindowDimensions } from "react-native";
import Svg, { Circle, Path, G } from "react-native-svg";
import { useRhythmStore } from "@/lib/store";
import { getCurrentPhase } from "@/lib/engine/menstrual";
import { getLunarPhase } from "@/lib/engine/lunar";
import { getSeason } from "@/lib/engine/seasonal";
import { scoreEvent } from "@/lib/engine/score";
import { addDays } from "@/lib/utils";
import { phaseColors, phaseLabels, seasonColors, colors } from "@/lib/theme";
import { MoonIcon } from "@/components/MoonIcon";
import type { CyclePhase } from "@/lib/types";

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  // Handle full circle by splitting into two semicircles
  if (endAngle - startAngle >= 360) {
    const mid = startAngle + 180;
    return describeArc(cx, cy, r, startAngle, mid) + " " + describeArc(cx, cy, r, mid, endAngle);
  }

  const startRad = toRad(startAngle - 90); // -90 to start from top
  const endRad = toRad(endAngle - 90);

  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);

  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

export function WheelChart() {
  const { width: screenWidth } = useWindowDimensions();
  const userProfile = useRhythmStore((s) => s.userProfile);
  const events = useRhythmStore((s) => s.events);

  const size = screenWidth - 48;
  const center = size / 2;

  const today = new Date().toISOString().split("T")[0];
  const daysInMonth = new Date(
    new Date(today).getFullYear(),
    new Date(today).getMonth() + 1,
    0
  ).getDate();

  const monthData = useMemo(() => {
    const year = new Date(today).getFullYear();
    const month = new Date(today).getMonth();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const phase = getCurrentPhase(userProfile.lastPeriodStart, userProfile.cycleLength, iso);
      const lunar = getLunarPhase(iso);
      const season = getSeason(iso, userProfile.location?.lat ?? 37.7749);
      const dayEvents = events.filter((e) => e.startTime.startsWith(iso));
      const scores = dayEvents.map((e) => scoreEvent(e, iso, userProfile).overall);
      const avgScore = scores.length > 0
        ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
        : null;
      return { day, iso, phase, lunar, season, avgScore, isToday: iso === today };
    });
  }, [today, daysInMonth, userProfile, events]);

  // Today's data for center
  const todayData = monthData.find((d) => d.isToday) ?? monthData[0];
  const todayLunar = todayData.lunar;
  const todayPhase = todayData.phase;

  // Daily average score
  const dailyAvg = useMemo(() => {
    const todayEvents = events.filter((e) => e.startTime.startsWith(today));
    if (todayEvents.length === 0) return 0;
    const scores = todayEvents.map((e) => scoreEvent(e, today, userProfile).overall);
    return Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
  }, [today, events, userProfile]);

  const degreesPerDay = 360 / daysInMonth;

  // Ring radii
  const outerR = (size - 20) / 2;
  const outerStroke = 18;
  const lunarR = outerR - outerStroke / 2 - 16;
  const innerR = lunarR - 16;
  const innerStroke = 14;

  // Build cycle arcs: group consecutive same-phase days
  const cycleArcs = useMemo(() => {
    const arcs: { phase: CyclePhase; startDay: number; endDay: number }[] = [];
    let current: { phase: CyclePhase; startDay: number; endDay: number } | null = null;

    for (const d of monthData) {
      if (current && current.phase === d.phase.phase) {
        current.endDay = d.day;
      } else {
        if (current) arcs.push(current);
        current = { phase: d.phase.phase, startDay: d.day, endDay: d.day };
      }
    }
    if (current) arcs.push(current);
    return arcs;
  }, [monthData]);

  return (
    <View className="items-center my-4">
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          {/* Outer ring: seasonal, segmented */}
          <G>
            {monthData.map((d) => {
              const startAngle = (d.day - 1) * degreesPerDay;
              const endAngle = startAngle + degreesPerDay - 1; // 1° gap
              const color = seasonColors[d.season.season];
              return (
                <Path
                  key={`season-${d.day}`}
                  d={describeArc(center, center, outerR, startAngle, endAngle)}
                  stroke={color}
                  strokeWidth={outerStroke}
                  fill="none"
                  strokeLinecap="round"
                />
              );
            })}
          </G>

          {/* Middle ring: lunar dots */}
          <G>
            {monthData.map((d) => {
              const angle = ((d.day - 0.5) * degreesPerDay - 90) * (Math.PI / 180);
              const x = center + lunarR * Math.cos(angle);
              const y = center + lunarR * Math.sin(angle);
              const opacity = 0.15 + d.lunar.illumination * 0.85;
              return (
                <Circle
                  key={`lunar-${d.day}`}
                  cx={x}
                  cy={y}
                  r={3}
                  fill={colors.text.primary}
                  opacity={opacity}
                />
              );
            })}
          </G>

          {/* Inner ring: cycle phase arcs */}
          <G>
            {cycleArcs.map((arc, i) => {
              const startAngle = (arc.startDay - 1) * degreesPerDay + 0.5; // 0.5° gap
              const endAngle = arc.endDay * degreesPerDay - 0.5;
              if (endAngle <= startAngle) return null;
              return (
                <Path
                  key={`cycle-${i}`}
                  d={describeArc(center, center, innerR, startAngle, endAngle)}
                  stroke={phaseColors[arc.phase]}
                  strokeWidth={innerStroke}
                  fill="none"
                  strokeLinecap="round"
                />
              );
            })}
          </G>
        </Svg>

        {/* Center overlay */}
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
          <MoonIcon phase={todayLunar.phase} size={28} />
          <Text className="text-text-primary text-3xl font-bold mt-1">
            {dailyAvg}
          </Text>
          <Text className="text-text-muted text-xs uppercase tracking-widest">
            {phaseLabels[todayPhase.phase]}
          </Text>
          <Text className="text-text-muted text-xs mt-0.5">
            {new Date(today + "T12:00:00").toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </Text>
        </View>
      </View>
    </View>
  );
}
