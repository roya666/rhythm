export type CyclePhase = "menstruation" | "follicular" | "ovulation" | "luteal";

export type PhaseInfo = {
  phase: CyclePhase;
  dayInPhase: number;
  totalDaysInPhase: number;
  energyLevel: number; // 0-100
  focusType: string; // e.g. "creative", "analytical", "social", "rest"
  description: string;
};

export type LunarPhase =
  | "new_moon"
  | "waxing_crescent"
  | "first_quarter"
  | "waxing_gibbous"
  | "full_moon"
  | "waning_gibbous"
  | "last_quarter"
  | "waning_crescent";

export type LunarInfo = {
  phase: LunarPhase;
  illumination: number; // 0-1
  name: string;
};

export type Season = "spring" | "summer" | "autumn" | "winter";

export type SeasonalInfo = {
  season: Season;
  energy: string;
  description: string;
};

export type UserProfile = {
  cycleLength: number; // typically 21-35 days
  lastPeriodStart: string; // ISO date
  location: { lat: number; lng: number } | null;
  calendarConnected: boolean;
};

export type CalendarEvent = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  energyDemand: "low" | "medium" | "high";
  rhythmScore: number; // 0-100
  phaseAtTime: CyclePhase;
};

export type RhythmScore = {
  overall: number; // 0-100
  cycleAlignment: number;
  lunarAlignment: number;
  seasonalAlignment: number;
  suggestion: string | null;
};

export type InsightType = "cycle" | "lunar" | "seasonal";

export type DailyInsight = {
  type: InsightType;
  title: string;
  message: string;
  icon: string;
};
