import { useMemo, useState } from "react";
import { View, Text, useWindowDimensions } from "react-native";
import Svg, { Circle, Path, G, Text as SvgText, Line } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { useRhythmStore } from "@/lib/store";
import { getCurrentPhase } from "@/lib/engine/menstrual";
import { getLunarPhase } from "@/lib/engine/lunar";
import { getSeason } from "@/lib/engine/seasonal";
import { scoreEvent } from "@/lib/engine/score";
import { addDays } from "@/lib/utils";
import {
  phaseColors,
  phaseLabels,
  seasonColors,
  seasonLabels,
  colors,
} from "@/lib/theme";
import { MoonIcon } from "@/components/MoonIcon";
import { PhaseDetailSheet } from "@/components/PhaseDetailSheet";
import type { CyclePhase, Season } from "@/lib/types";

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  if (endAngle - startAngle >= 360) {
    const mid = startAngle + 180;
    return describeArc(cx, cy, r, startAngle, mid) + " " + describeArc(cx, cy, r, mid, endAngle);
  }

  const startRad = toRad(startAngle - 90);
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

  const [selectedPhase, setSelectedPhase] = useState<CyclePhase | null>(null);

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

  const todayData = monthData.find((d) => d.isToday) ?? monthData[0];
  const todayLunar = todayData.lunar;
  const todayPhase = todayData.phase;
  const todaySeason = todayData.season;

  const degreesPerDay = 360 / daysInMonth;

  // Ring radii — cycle outermost, season innermost
  const cycleR = (size - 24) / 2;
  const cycleStroke = 28;
  const lunarR = cycleR - 28;
  const lunarDotR = 4.5;
  const lunarKeyDotR = 6;
  const seasonR = lunarR - 14;
  const seasonStroke = 12;

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

  // Build season arcs: group consecutive same-season days
  const seasonArcs = useMemo(() => {
    const arcs: { season: Season; startDay: number; endDay: number }[] = [];
    let current: { season: Season; startDay: number; endDay: number } | null = null;

    for (const d of monthData) {
      if (current && current.season === d.season.season) {
        current.endDay = d.day;
      } else {
        if (current) arcs.push(current);
        current = { season: d.season.season, startDay: d.day, endDay: d.day };
      }
    }
    if (current) arcs.push(current);
    return arcs;
  }, [monthData]);

  // Today indicator angle
  const todayIndex = monthData.findIndex((d) => d.isToday);
  const todayAngle = todayIndex >= 0 ? (todayIndex + 0.5) * degreesPerDay : 0;
  const todayAngleRad = ((todayAngle - 90) * Math.PI) / 180;

  // Selected phase detail data
  const selectedPhaseData = useMemo(() => {
    if (!selectedPhase) return null;
    const dayData = monthData.find((d) => d.phase.phase === selectedPhase);
    if (!dayData) return null;
    const isActive = todayPhase.phase === selectedPhase;
    return {
      currentDay: isActive ? todayPhase.dayInPhase : null,
      totalDays: isActive ? todayPhase.totalDaysInPhase : null,
    };
  }, [selectedPhase, monthData, todayPhase]);

  function handleArcPress(phase: CyclePhase) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPhase(phase);
  }

  /** Compute rotation for arc label so bottom-half text reads left-to-right */
  function labelRotation(midAngle: number): number {
    // midAngle is 0=top, clockwise
    const adjusted = ((midAngle % 360) + 360) % 360;
    if (adjusted > 90 && adjusted < 270) return adjusted + 180;
    return adjusted;
  }

  return (
    <View className="items-center my-4">
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          {/* === OUTER: Cycle phase arcs === */}
          <G>
            {cycleArcs.map((arc, i) => {
              const startAngle = (arc.startDay - 1) * degreesPerDay + 0.5;
              const endAngle = arc.endDay * degreesPerDay - 0.5;
              if (endAngle <= startAngle) return null;

              const isActive = todayPhase.phase === arc.phase;
              const spanDeg = endAngle - startAngle;

              return (
                <G key={`cycle-${i}`}>
                  <Path
                    d={describeArc(center, center, cycleR, startAngle, endAngle)}
                    stroke={phaseColors[arc.phase]}
                    strokeWidth={isActive ? cycleStroke + 4 : cycleStroke}
                    fill="none"
                    strokeLinecap="round"
                    opacity={isActive ? 1 : 0.6}
                    onPress={() => handleArcPress(arc.phase)}
                  />
                  {/* Phase name label on arc (only if >30deg) */}
                  {spanDeg > 30 && (() => {
                    const midAngle = (startAngle + endAngle) / 2;
                    const midRad = ((midAngle - 90) * Math.PI) / 180;
                    const lx = center + cycleR * Math.cos(midRad);
                    const ly = center + cycleR * Math.sin(midRad);
                    const rot = labelRotation(midAngle);
                    return (
                      <SvgText
                        x={lx}
                        y={ly}
                        fill={colors.text.primary}
                        fontSize={9}
                        fontWeight="600"
                        textAnchor="middle"
                        alignmentBaseline="central"
                        rotation={rot}
                        origin={`${lx}, ${ly}`}
                        opacity={isActive ? 1 : 0.8}
                      >
                        {phaseLabels[arc.phase].toUpperCase()}
                      </SvgText>
                    );
                  })()}
                </G>
              );
            })}
          </G>

          {/* === MIDDLE: Lunar dots === */}
          <G>
            {monthData.map((d) => {
              const angle = ((d.day - 0.5) * degreesPerDay - 90) * (Math.PI / 180);
              const x = center + lunarR * Math.cos(angle);
              const y = center + lunarR * Math.sin(angle);
              const opacity = 0.15 + d.lunar.illumination * 0.85;
              const isKey = d.lunar.phase === "full_moon" || d.lunar.phase === "new_moon";
              return (
                <G key={`lunar-${d.day}`}>
                  <Circle
                    cx={x}
                    cy={y}
                    r={isKey ? lunarKeyDotR : lunarDotR}
                    fill={colors.text.primary}
                    opacity={opacity}
                  />
                  {/* "Full" / "New" label next to key moon dots */}
                  {isKey && (() => {
                    const labelAngle = (d.day - 0.5) * degreesPerDay;
                    const labelRad = ((labelAngle - 90) * Math.PI) / 180;
                    const offset = 12;
                    const lx = center + (lunarR + offset) * Math.cos(labelRad);
                    const ly = center + (lunarR + offset) * Math.sin(labelRad);
                    return (
                      <SvgText
                        x={lx}
                        y={ly}
                        fill={colors.text.muted}
                        fontSize={7}
                        fontWeight="500"
                        textAnchor="middle"
                        alignmentBaseline="central"
                        rotation={labelRotation(labelAngle)}
                        origin={`${lx}, ${ly}`}
                      >
                        {d.lunar.phase === "full_moon" ? "FULL" : "NEW"}
                      </SvgText>
                    );
                  })()}
                </G>
              );
            })}
          </G>

          {/* === INNER: Season arc(s) === */}
          <G>
            {seasonArcs.map((arc, i) => {
              const startAngle = (arc.startDay - 1) * degreesPerDay + 0.5;
              const endAngle = arc.endDay * degreesPerDay - 0.5;
              if (endAngle <= startAngle) return null;

              const spanDeg = endAngle - startAngle;

              return (
                <G key={`season-${i}`}>
                  <Path
                    d={describeArc(center, center, seasonR, startAngle, endAngle)}
                    stroke={seasonColors[arc.season]}
                    strokeWidth={seasonStroke}
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Season name label (only if >30deg) */}
                  {spanDeg > 30 && (() => {
                    const midAngle = (startAngle + endAngle) / 2;
                    const midRad = ((midAngle - 90) * Math.PI) / 180;
                    const lx = center + seasonR * Math.cos(midRad);
                    const ly = center + seasonR * Math.sin(midRad);
                    const rot = labelRotation(midAngle);
                    return (
                      <SvgText
                        x={lx}
                        y={ly}
                        fill={colors.text.primary}
                        fontSize={8}
                        fontWeight="600"
                        textAnchor="middle"
                        alignmentBaseline="central"
                        rotation={rot}
                        origin={`${lx}, ${ly}`}
                      >
                        {seasonLabels[arc.season].toUpperCase()}
                      </SvgText>
                    );
                  })()}
                </G>
              );
            })}
          </G>

          {/* === Ring category labels at ~330° === */}
          <G>
            {[
              { label: "CYCLE", r: cycleR },
              { label: "MOON", r: lunarR },
              { label: "SEASON", r: seasonR },
            ].map(({ label, r }) => {
              const angle = 330;
              const rad = ((angle - 90) * Math.PI) / 180;
              const x = center + r * Math.cos(rad);
              const y = center + r * Math.sin(rad);
              return (
                <SvgText
                  key={label}
                  x={x}
                  y={y}
                  fill={colors.text.muted}
                  fontSize={6}
                  fontWeight="500"
                  textAnchor="middle"
                  alignmentBaseline="central"
                  rotation={labelRotation(angle)}
                  origin={`${x}, ${y}`}
                  opacity={0.6}
                >
                  {label}
                </SvgText>
              );
            })}
          </G>

          {/* === Today indicator line === */}
          {todayIndex >= 0 && (
            <G>
              <Line
                x1={center + (seasonR - seasonStroke / 2) * Math.cos(todayAngleRad)}
                y1={center + (seasonR - seasonStroke / 2) * Math.sin(todayAngleRad)}
                x2={center + (cycleR + cycleStroke / 2) * Math.cos(todayAngleRad)}
                y2={center + (cycleR + cycleStroke / 2) * Math.sin(todayAngleRad)}
                stroke={colors.text.primary}
                strokeWidth={1.5}
                opacity={0.5}
              />
              <Circle
                cx={center + (cycleR + cycleStroke / 2) * Math.cos(todayAngleRad)}
                cy={center + (cycleR + cycleStroke / 2) * Math.sin(todayAngleRad)}
                r={3}
                fill={colors.text.primary}
              />
            </G>
          )}
        </Svg>

        {/* Center overlay — three-rhythm summary */}
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
          <Text className="text-text-primary text-lg font-bold mt-1">
            {phaseLabels[todayPhase.phase]}
          </Text>
          <Text className="text-text-muted text-xs mt-0.5">
            Day {todayPhase.dayInPhase} of {todayPhase.totalDaysInPhase}
          </Text>
          <Text className="text-text-muted text-xs mt-0.5">
            {todayLunar.name}
          </Text>
          <Text className="text-text-muted text-xs mt-0.5">
            {seasonLabels[todaySeason.season]}
          </Text>
          <Text className="text-text-muted text-xs mt-0.5">
            {new Date(today + "T12:00:00").toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </Text>
        </View>
      </View>

      {/* Phase detail bottom sheet */}
      <PhaseDetailSheet
        visible={selectedPhase != null}
        onClose={() => setSelectedPhase(null)}
        phase={selectedPhase}
        currentDay={selectedPhaseData?.currentDay ?? null}
        totalDays={selectedPhaseData?.totalDays ?? null}
      />
    </View>
  );
}
