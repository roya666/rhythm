import type { PhaseInfo, CyclePhase } from "../types";
import { daysBetween, addDays } from "../utils";

type PhaseDef = {
  phase: CyclePhase;
  energyLevel: number;
  focusType: string;
  description: string;
};

export const PHASE_DEFS: PhaseDef[] = [
  {
    phase: "menstruation",
    energyLevel: 20,
    focusType: "rest",
    description: "Low energy — honor rest and gentle movement.",
  },
  {
    phase: "follicular",
    energyLevel: 60,
    focusType: "creative",
    description: "Rising energy — great for learning and starting new projects.",
  },
  {
    phase: "ovulation",
    energyLevel: 90,
    focusType: "social",
    description: "Peak energy — ideal for collaboration and big efforts.",
  },
  {
    phase: "luteal",
    energyLevel: 45,
    focusType: "analytical",
    description: "Winding down — good for detail work and completing tasks.",
  },
];

// Default 28-day boundaries (1-indexed, inclusive)
const DEFAULT_BOUNDARIES = [
  { start: 1, end: 5 }, // menstruation
  { start: 6, end: 13 }, // follicular
  { start: 14, end: 16 }, // ovulation
  { start: 17, end: 28 }, // luteal
];

function getScaledBoundaries(cycleLength: number) {
  return DEFAULT_BOUNDARIES.map((b) => ({
    start: Math.round((b.start * cycleLength) / 28),
    end: Math.round((b.end * cycleLength) / 28),
  }));
}

/** Calculate the current menstrual cycle phase for a given date. */
export function getCurrentPhase(
  lastPeriodStart: string,
  cycleLength: number,
  targetDate: string = new Date().toISOString().split("T")[0]
): PhaseInfo {
  const diff = daysBetween(lastPeriodStart, targetDate);
  const dayInCycle = ((diff % cycleLength) + cycleLength) % cycleLength + 1;

  const boundaries = getScaledBoundaries(cycleLength);

  for (let i = 0; i < boundaries.length; i++) {
    const { start, end } = boundaries[i];
    if (dayInCycle >= start && dayInCycle <= end) {
      const def = PHASE_DEFS[i];
      return {
        phase: def.phase,
        dayInPhase: dayInCycle - start + 1,
        totalDaysInPhase: end - start + 1,
        energyLevel: def.energyLevel,
        focusType: def.focusType,
        description: def.description,
      };
    }
  }

  // Fallback to luteal if rounding leaves a gap
  const luteal = PHASE_DEFS[3];
  const last = boundaries[3];
  return {
    phase: luteal.phase,
    dayInPhase: dayInCycle - last.start + 1,
    totalDaysInPhase: last.end - last.start + 1,
    energyLevel: luteal.energyLevel,
    focusType: luteal.focusType,
    description: luteal.description,
  };
}

/** Get phase info for each day in a date range. */
export function getPhaseForDateRange(
  start: string,
  end: string,
  lastPeriodStart: string,
  cycleLength: number
): PhaseInfo[] {
  const result: PhaseInfo[] = [];
  const totalDays = daysBetween(start, end);
  for (let i = 0; i <= totalDays; i++) {
    const date = addDays(start, i);
    result.push(getCurrentPhase(lastPeriodStart, cycleLength, date));
  }
  return result;
}
