import type { SeasonalInfo, Season } from "../types";

type SeasonDef = { season: Season; energy: string; description: string };

const SEASON_DEFS: Record<Season, SeasonDef> = {
  spring: {
    season: "spring",
    energy: "growth",
    description: "Lengthening days spark new beginnings and creative energy.",
  },
  summer: {
    season: "summer",
    energy: "peak",
    description: "Long days and warmth fuel peak activity and social energy.",
  },
  autumn: {
    season: "autumn",
    energy: "harvest",
    description: "Cooling days favor wrapping up projects and gathering results.",
  },
  winter: {
    season: "winter",
    energy: "rest",
    description: "Shorter days invite reflection and restoration.",
  },
};

// Equinox/solstice boundaries as [month, day] (northern hemisphere)
const BOUNDARIES: { season: Season; month: number; day: number }[] = [
  { season: "spring", month: 3, day: 20 },
  { season: "summer", month: 6, day: 21 },
  { season: "autumn", month: 9, day: 22 },
  { season: "winter", month: 12, day: 21 },
];

function getNorthernSeason(month: number, day: number): Season {
  if (month < 3 || (month === 3 && day < 20)) return "winter";
  if (month < 6 || (month === 6 && day < 21)) return "spring";
  if (month < 9 || (month === 9 && day < 22)) return "summer";
  if (month < 12 || (month === 12 && day < 21)) return "autumn";
  return "winter";
}

const FLIP: Record<Season, Season> = {
  spring: "autumn",
  summer: "winter",
  autumn: "spring",
  winter: "summer",
};

/** Determine the current season and energy level for a location + date. */
export function getSeason(
  date: string = new Date().toISOString().split("T")[0],
  latitude: number = 37.7749
): SeasonalInfo {
  const d = new Date(date);
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();

  let season = getNorthernSeason(month, day);
  if (latitude < 0) season = FLIP[season];

  return SEASON_DEFS[season];
}

/** Estimate daylight hours for a date and location. */
export function getDaylightHours(
  date: string,
  lat: number,
  _lng: number
): number {
  const d = new Date(date);
  // Day of year
  const start = new Date(d.getUTCFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86_400_000);

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  // Solar declination
  const declination = 23.45 * Math.sin(toRad((360 / 365) * (284 + dayOfYear)));
  const decRad = toRad(declination);
  const latRad = toRad(lat);

  const cosOmega = -Math.tan(latRad) * Math.tan(decRad);

  // Polar regions: perpetual day or night
  if (cosOmega < -1) return 24;
  if (cosOmega > 1) return 0;

  const omega = Math.acos(cosOmega);
  const hours = (2 * omega * 180) / (Math.PI * 15);

  return Math.round(hours * 100) / 100;
}
