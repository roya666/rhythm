import { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, SafeAreaView } from "react-native";
import { useRhythmStore } from "@/lib/store";
import { getCurrentPhase } from "@/lib/engine/menstrual";
import { getLunarPhase } from "@/lib/engine/lunar";
import { scoreEvent } from "@/lib/engine/score";
import { suggestReschedule } from "@/lib/engine/suggest";
import { getDailyInsight } from "@/lib/engine/insight";
import type { CalendarEvent, RhythmScore } from "@/lib/types";
import { phaseColors, phaseLabels } from "@/lib/theme";
import { PhaseBar } from "@/components/PhaseBar";
import { ScoreRing } from "@/components/ScoreRing";
import { EventCard } from "@/components/EventCard";
import { AlignmentSheet } from "@/components/AlignmentSheet";
import { NudgeCard } from "@/components/NudgeCard";
import { InsightCard } from "@/components/InsightCard";

export default function TodayScreen() {
  const userProfile = useRhythmStore((s) => s.userProfile);
  const events = useRhythmStore((s) => s.events);
  const setCurrentPhase = useRhythmStore((s) => s.setCurrentPhase);

  const today = new Date().toISOString().split("T")[0];

  const phase = useMemo(
    () => getCurrentPhase(userProfile.lastPeriodStart, userProfile.cycleLength, today),
    [userProfile.lastPeriodStart, userProfile.cycleLength, today]
  );

  const lunar = useMemo(() => getLunarPhase(today), [today]);

  useEffect(() => {
    setCurrentPhase(phase.phase);
  }, [phase.phase, setCurrentPhase]);

  const todayEvents = useMemo(
    () => events.filter((e) => e.startTime.startsWith(today)),
    [events, today]
  );

  const scoredEvents = useMemo(
    () =>
      todayEvents.map((event) => ({
        event,
        score: scoreEvent(event, today, userProfile),
      })),
    [todayEvents, today, userProfile]
  );

  const avgScore = useMemo(() => {
    if (scoredEvents.length === 0) return 0;
    const sum = scoredEvents.reduce((acc, { score }) => acc + score.overall, 0);
    return Math.round(sum / scoredEvents.length);
  }, [scoredEvents]);

  const nudgeEvents = useMemo(
    () => scoredEvents.filter(({ score }) => score.overall < 40),
    [scoredEvents]
  );

  const insight = useMemo(
    () =>
      getDailyInsight(
        today,
        userProfile.lastPeriodStart,
        userProfile.cycleLength,
        userProfile.location?.lat
      ),
    [today, userProfile.lastPeriodStart, userProfile.cycleLength, userProfile.location?.lat]
  );

  const [selectedEvent, setSelectedEvent] = useState<{
    event: CalendarEvent;
    score: RhythmScore;
  } | null>(null);

  const suggestion = useMemo(() => {
    if (!selectedEvent) return null;
    return suggestReschedule(selectedEvent.event, userProfile);
  }, [selectedEvent, userProfile]);

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="pt-4 pb-2 px-4">
          <Text className="text-text-muted text-sm uppercase tracking-widest">
            Today
          </Text>
        </View>

        <PhaseBar phase={phase} lunarPhase={lunar} />

        <InsightCard insight={insight} phaseColor={phaseColors[phase.phase]} />

        <ScoreRing score={avgScore} />

        {nudgeEvents.length > 0 && (
          <>
            <View className="px-4 mb-3 mt-2">
              <Text className="text-text-primary text-lg font-bold">
                Heads Up
              </Text>
            </View>
            {nudgeEvents.map(({ event, score }) => (
              <NudgeCard
                key={event.id}
                event={event}
                score={score}
                phaseName={phaseLabels[phase.phase]}
                onViewSuggestion={() => setSelectedEvent({ event, score })}
              />
            ))}
          </>
        )}

        <View className="px-4 mb-3 mt-2">
          <Text className="text-text-primary text-lg font-bold">
            Today's Events
          </Text>
        </View>

        {scoredEvents.length === 0 ? (
          <View className="px-4">
            <Text className="text-text-muted text-sm">
              No events scheduled for today.
            </Text>
          </View>
        ) : (
          scoredEvents.map(({ event, score }) => (
            <EventCard
              key={event.id}
              event={event}
              score={score}
              onPress={() => setSelectedEvent({ event, score })}
            />
          ))
        )}
      </ScrollView>

      {selectedEvent && (
        <AlignmentSheet
          visible={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          event={selectedEvent.event}
          score={selectedEvent.score}
          suggestion={suggestion}
        />
      )}
    </SafeAreaView>
  );
}
