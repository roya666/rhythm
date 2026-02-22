import Svg, { Circle } from "react-native-svg";
import { colors } from "@/lib/theme";

export function AppIcon({ size = 80 }: { size?: number }) {
  const r = size / 2;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={r} cy={r} r={r * 0.9} fill={colors.accent.blood} />
      <Circle
        cx={r + r * 0.35}
        cy={r}
        r={r * 0.75}
        fill={colors.bg.primary}
      />
    </Svg>
  );
}
