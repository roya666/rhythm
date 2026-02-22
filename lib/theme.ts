import type { Season } from "./types";

/** Design tokens as JS constants — use for SVG fills, Reanimated values, and anywhere Tailwind classes can't reach. */

export const colors = {
  bg: {
    primary: "#0A0A0A",
    surface: "#1A1A1A",
    elevated: "#2A2A2A",
  },
  accent: {
    blood: "#660810",
    wine: "#891D1A",
    slate: "#5E657B",
    orange: "#D6C0B1",
    olive: "#210706",
  },
  text: {
    primary: "#F1EBEB",
    muted: "#8A8A8A",
  },
  score: {
    high: "#4A7C59",
    mid: "#D6C0B1",
    low: "#891D1A",
  },
} as const;

/** Map cycle phase → accent color */
export const phaseColors = {
  menstruation: colors.accent.blood,
  follicular: colors.accent.slate,
  ovulation: colors.accent.orange,
  luteal: colors.accent.wine,
} as const;

/** Map cycle phase → human-readable label */
export const phaseLabels = {
  menstruation: "Menstruation",
  follicular: "Follicular",
  ovulation: "Ovulation",
  luteal: "Luteal",
} as const;

/** Map season → accent color */
export const seasonColors: Record<Season, string> = {
  spring: colors.accent.slate,
  summer: colors.accent.orange,
  autumn: colors.accent.wine,
  winter: colors.accent.blood,
};

/** Map season → human-readable label */
export const seasonLabels: Record<Season, string> = {
  spring: "Spring",
  summer: "Summer",
  autumn: "Autumn",
  winter: "Winter",
};
