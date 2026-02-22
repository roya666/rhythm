import { Text } from "react-native";
import type { LunarPhase } from "@/lib/types";

const MOON_EMOJI: Record<LunarPhase, string> = {
  new_moon: "\u{1F311}",
  waxing_crescent: "\u{1F312}",
  first_quarter: "\u{1F313}",
  waxing_gibbous: "\u{1F314}",
  full_moon: "\u{1F315}",
  waning_gibbous: "\u{1F316}",
  last_quarter: "\u{1F317}",
  waning_crescent: "\u{1F318}",
};

export function MoonIcon({
  phase,
  size = 24,
}: {
  phase: LunarPhase;
  size?: number;
}) {
  return <Text style={{ fontSize: size }}>{MOON_EMOJI[phase]}</Text>;
}
