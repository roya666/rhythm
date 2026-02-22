import type { LunarInfo, LunarPhase } from "../types";
import { daysBetween } from "../utils";

const SYNODIC_PERIOD = 29.53059;
const LUNAR_EPOCH = "2000-01-06"; // Known new moon: Jan 6, 2000 00:18 UTC

const PHASE_NAMES: { phase: LunarPhase; name: string }[] = [
  { phase: "new_moon", name: "New Moon" },
  { phase: "waxing_crescent", name: "Waxing Crescent" },
  { phase: "first_quarter", name: "First Quarter" },
  { phase: "waxing_gibbous", name: "Waxing Gibbous" },
  { phase: "full_moon", name: "Full Moon" },
  { phase: "waning_gibbous", name: "Waning Gibbous" },
  { phase: "last_quarter", name: "Last Quarter" },
  { phase: "waning_crescent", name: "Waning Crescent" },
];

/** Calculate the lunar phase for a given date. */
export function getLunarPhase(
  date: string = new Date().toISOString().split("T")[0]
): LunarInfo {
  const daysSinceNew = daysBetween(LUNAR_EPOCH, date);
  const phaseDay =
    ((daysSinceNew % SYNODIC_PERIOD) + SYNODIC_PERIOD) % SYNODIC_PERIOD;

  // Divide synodic period into 8 equal phases
  const phaseSegment = SYNODIC_PERIOD / 8;
  const index = Math.min(Math.floor(phaseDay / phaseSegment), 7);

  // Illumination: 0 at new moon, 1 at full moon
  const illumination =
    (1 - Math.cos((2 * Math.PI * phaseDay) / SYNODIC_PERIOD)) / 2;

  const { phase, name } = PHASE_NAMES[index];
  return { phase, illumination: Math.round(illumination * 100) / 100, name };
}
