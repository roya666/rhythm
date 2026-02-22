import type { RhythmScore, CalendarEvent, UserProfile } from "../types";
import { getCurrentPhase } from "./menstrual";
import { getLunarPhase } from "./lunar";
import { getSeason } from "./seasonal";

function demandValue(demand: "low" | "medium" | "high"): number {
  if (demand === "high") return 1;
  if (demand === "medium") return 0.5;
  return 0;
}

/** Score how well an event aligns with the user's natural rhythms. */
export function scoreEvent(
  event: CalendarEvent,
  date: string,
  userProfile: UserProfile
): RhythmScore {
  const phase = getCurrentPhase(
    userProfile.lastPeriodStart,
    userProfile.cycleLength,
    date
  );
  const lunar = getLunarPhase(date);
  const lat = userProfile.location?.lat ?? 37.7749;
  const seasonal = getSeason(date, lat);

  const demand = demandValue(event.energyDemand);

  // Cycle alignment (50%): match energy demand to phase energy
  const phaseEnergy = phase.energyLevel / 100; // normalize 0-1
  // High demand + high energy = 100, high demand + low energy = low score
  // Low demand + low energy = 100, low demand + high energy = low score
  const cycleAlignment = Math.round(
    (1 - Math.abs(demand - phaseEnergy)) * 100
  );

  // Lunar alignment (20%): full moon boosts high-energy, new moon boosts low
  const lunarMatch = demand * lunar.illumination + (1 - demand) * (1 - lunar.illumination);
  const lunarAlignment = Math.round(lunarMatch * 100);

  // Seasonal alignment (30%): summer/spring boost high-energy, winter/autumn boost low
  const seasonEnergy =
    seasonal.energy === "peak"
      ? 1
      : seasonal.energy === "growth"
        ? 0.75
        : seasonal.energy === "harvest"
          ? 0.35
          : 0.1; // rest
  const seasonalAlignment = Math.round(
    (1 - Math.abs(demand - seasonEnergy)) * 100
  );

  const overall = Math.round(
    Math.min(
      100,
      Math.max(
        0,
        cycleAlignment * 0.5 + lunarAlignment * 0.2 + seasonalAlignment * 0.3
      )
    )
  );

  let suggestion: string | null = null;
  if (overall < 50) {
    const phaseLabel =
      phase.energyLevel >= 60 ? "luteal or menstruation" : "follicular";
    suggestion =
      event.energyDemand === "high" || event.energyDemand === "medium"
        ? `Consider moving this to your follicular phase when energy peaks.`
        : `Consider moving this to your ${phaseLabel} phase for a quieter rhythm.`;
  }

  return { overall, cycleAlignment, lunarAlignment, seasonalAlignment, suggestion };
}
