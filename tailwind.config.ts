import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "bg-primary": "#0A0A0A",
        "bg-surface": "#1A1A1A",
        "bg-elevated": "#2A2A2A",
        "accent-blood": "#660810",
        "accent-wine": "#891D1A",
        "accent-slate": "#5E657B",
        "accent-orange": "#D6C0B1",
        "accent-olive": "#210706",
        "text-primary": "#F1EBEB",
        "text-muted": "#8A8A8A",
        "score-high": "#4A7C59",
        "score-mid": "#D6C0B1",
        "score-low": "#891D1A",
      },
    },
  },
  plugins: [],
} satisfies Config;
