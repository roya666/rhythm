import type { DailyInsight, InsightType } from "../types";
import { getCurrentPhase } from "./menstrual";
import { getLunarPhase } from "./lunar";
import { getSeason } from "./seasonal";

const CYCLE_INSIGHTS: Record<string, { title: string; message: string; icon: string }> = {
  menstruation: {
    title: "Rest & Restore",
    message: "Low energy — honor rest and gentle movement.",
    icon: "🌙",
  },
  follicular: {
    title: "Rising Energy",
    message: "Rising energy — great for brainstorming and new projects.",
    icon: "🌱",
  },
  ovulation: {
    title: "Peak Power",
    message: "Peak energy — ideal for collaboration and big efforts.",
    icon: "☀️",
  },
  luteal: {
    title: "Wind Down",
    message: "Winding down — good for detail work and completing tasks.",
    icon: "🍂",
  },
};

const LUNAR_INSIGHTS: Record<string, { title: string; message: string; icon: string }> = {
  new_moon: {
    title: "New Moon",
    message: "Set intentions and plant seeds for the cycle ahead.",
    icon: "🌑",
  },
  waxing_crescent: {
    title: "Waxing Crescent",
    message: "Momentum builds — take first steps on new plans.",
    icon: "🌒",
  },
  first_quarter: {
    title: "First Quarter",
    message: "Decision time — commit to what matters most.",
    icon: "🌓",
  },
  waxing_gibbous: {
    title: "Waxing Gibbous",
    message: "Refine and adjust — almost at full power.",
    icon: "🌔",
  },
  full_moon: {
    title: "Full Moon",
    message: "Peak illumination — celebrate progress and release what's not serving you.",
    icon: "🌕",
  },
  waning_gibbous: {
    title: "Waning Gibbous",
    message: "Share wisdom and gratitude from recent efforts.",
    icon: "🌖",
  },
  last_quarter: {
    title: "Last Quarter",
    message: "Let go of what didn't work — make space for the new.",
    icon: "🌗",
  },
  waning_crescent: {
    title: "Waning Crescent",
    message: "Surrender and rest — the cycle is completing.",
    icon: "🌘",
  },
};

const SEASONAL_INSIGHTS: Record<string, { title: string; message: string; icon: string }> = {
  spring: {
    title: "Spring Renewal",
    message: "Lengthening days spark new beginnings and creative energy.",
    icon: "🌸",
  },
  summer: {
    title: "Summer Radiance",
    message: "Long days and warmth fuel peak activity and social energy.",
    icon: "🌻",
  },
  autumn: {
    title: "Autumn Harvest",
    message: "Cooling days favor wrapping up projects and gathering results.",
    icon: "🍁",
  },
  winter: {
    title: "Winter Stillness",
    message: "Shorter days invite reflection and restoration.",
    icon: "❄️",
  },
};

function dayOfYear(date: string): number {
  const d = new Date(date);
  const start = new Date(d.getUTCFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86_400_000);
}

/** Get a deterministic daily insight that rotates through cycle/lunar/seasonal. */
export function getDailyInsight(
  date: string,
  lastPeriodStart: string,
  cycleLength: number,
  latitude?: number
): DailyInsight {
  const types: InsightType[] = ["cycle", "lunar", "seasonal"];
  const type = types[dayOfYear(date) % 3];

  if (type === "cycle") {
    const phase = getCurrentPhase(lastPeriodStart, cycleLength, date);
    const insight = CYCLE_INSIGHTS[phase.phase];
    return { type, ...insight };
  }

  if (type === "lunar") {
    const lunar = getLunarPhase(date);
    const insight = LUNAR_INSIGHTS[lunar.phase];
    return { type, ...insight };
  }

  const season = getSeason(date, latitude ?? 37.7749);
  const insight = SEASONAL_INSIGHTS[season.season];
  return { type, ...insight };
}
