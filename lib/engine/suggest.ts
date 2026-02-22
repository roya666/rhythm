import type { CalendarEvent, UserProfile } from "../types";
import { addDays } from "../utils";
import { scoreEvent } from "./score";
import { getCurrentPhase } from "./menstrual";

type Suggestion = {
  suggestedDate: string;
  score: number;
  reasoning: string;
} | null;

/** Suggest a better date for an event based on rhythm alignment. */
export function suggestReschedule(
  event: CalendarEvent,
  userProfile: UserProfile,
  windowDays: number = 7
): Suggestion {
  const eventDate = event.startTime.split("T")[0];
  const currentScore = scoreEvent(event, eventDate, userProfile);

  let bestDate = eventDate;
  let bestScore = currentScore.overall;

  for (let offset = -windowDays; offset <= windowDays; offset++) {
    if (offset === 0) continue;
    const candidate = addDays(eventDate, offset);
    const candidateScore = scoreEvent(event, candidate, userProfile);
    if (candidateScore.overall > bestScore) {
      bestScore = candidateScore.overall;
      bestDate = candidate;
    }
  }

  if (bestScore <= currentScore.overall) return null;

  const bestPhase = getCurrentPhase(
    userProfile.lastPeriodStart,
    userProfile.cycleLength,
    bestDate
  );

  return {
    suggestedDate: bestDate,
    score: bestScore,
    reasoning: `Moving to ${bestDate} aligns with your ${bestPhase.phase} phase (${bestPhase.focusType} energy, ${bestPhase.energyLevel}% level) for a better rhythm score of ${bestScore}.`,
  };
}
