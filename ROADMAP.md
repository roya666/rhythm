# Rhythm - Implementation Roadmap

> "We plan our lives around a 2,000 year old calendar designed by emperors. What if we planned around the rhythms our bodies actually follow?"

A mobile calendar app that layers natural rhythms — menstrual cycles, lunar phases, and seasonal energy — onto your schedule.

---

## Design Foundation

### Color System (Dark Mode Only)

| Token              | Hex       | Usage                                    |
|--------------------|-----------|------------------------------------------|
| `bg-primary`       | `#0A0A0A` | Main background (near-black)             |
| `bg-surface`       | `#1A1A1A` | Cards, bottom sheets, surfaces           |
| `bg-elevated`      | `#2A2A2A` | Elevated elements, input fields          |
| `accent-blood`     | `#660810` | Deep red — menstrual phase, brand        |
| `accent-wine`      | `#891D1A` | Tuscan red — luteal phase                |
| `accent-slate`     | `#5E657B` | Slate blue — follicular phase            |
| `accent-orange`    | `#D6C0B1` | Grey orange — ovulation, warm energy     |
| `accent-olive`     | `#210706` | Olivewood — deep accents                 |
| `text-primary`     | `#F1EBEB` | Stone cream — primary text               |
| `text-muted`       | `#8A8A8A` | Secondary/supporting text                |
| `score-high`       | `#4A7C59` | Good alignment (muted green)             |
| `score-mid`        | `#D6C0B1` | Moderate alignment (warm)                |
| `score-low`        | `#891D1A` | Poor alignment (wine)                    |

### Phase Visual Identity

| Phase         | Color     | Energy               | Motif                              |
|---------------|-----------|----------------------|------------------------------------|
| Menstruation  | `#660810` | Rest, reflection     | Crescent moon, pomegranate         |
| Follicular    | `#5E657B` | Rising, learning     | Waxing moon, morning sky gradient  |
| Ovulation     | `#D6C0B1` | Peak, communication  | Full moon, sun, fig                |
| Luteal        | `#891D1A` | Detail → wind down   | Waning moon, berries               |

### Aesthetic Principles

- Dark canvas with warm, organic accents (not cold/techy)
- Celestial hand-drawn illustration style for icons and empty states
- Circles over grids — cycles are circles, not timelines
- Gradients represent energy flowing through phases
- Serif headers (editorial), sans-serif data (clean). Sophisticated, not cute.
- Botanical/fruit textures for onboarding and decorative elements

---

## Tech Stack

| Layer          | Choice                    | Why                                     |
|----------------|---------------------------|-----------------------------------------|
| Framework      | Expo SDK 52+ (TypeScript) | Managed workflow, no native config pain |
| Navigation     | Expo Router               | File-based routing, fast setup          |
| Styling        | Nativewind (Tailwind RN)  | Utility classes, rapid iteration        |
| Visualization  | react-native-svg          | Wheel view, custom arcs, phase rings    |
| Animation      | react-native-reanimated   | Smooth wheel transitions, gestures      |
| Calendar API   | Google Calendar REST API   | Via expo-auth-session OAuth             |
| Cycle data     | Manual input (v1)         | Avoids HealthKit complexity at hackathon|
| Lunar/solar    | Custom math + SunCalc     | Zero API dependencies                   |
| Storage        | AsyncStorage              | Simple, local, private                  |
| State          | Zustand                   | Lightweight, works great with RN        |
| Deploy         | Expo Go / EAS Build       | Instant preview on device               |

---

## Phase 0: Project Scaffold

**Time: ~45 min**

- [x] Initialize Expo project with TypeScript template
- [x] Install core dependencies:
  - `nativewind` + `tailwindcss`
  - `react-native-svg`
  - `react-native-reanimated`
  - `expo-router`
  - `zustand`
  - `expo-location`
  - `expo-auth-session`
  - `@react-native-async-storage/async-storage`
- [x] Set up Expo Router file structure:
  ```
  app/
    (tabs)/
      index.tsx          # Today screen
      week.tsx           # Week view
      wheel.tsx          # Wheel/cycle view
      profile.tsx        # Settings & onboarding
    _layout.tsx          # Root layout + tab bar
    onboarding/
      index.tsx          # Welcome
      cycle.tsx          # Cycle info input
      calendar.tsx       # Connect Google Calendar
      location.tsx       # Location permission
  ```
- [x] Create theme system (`lib/theme.ts`) with all design tokens
- [x] Create core type definitions (`lib/types.ts`):
  ```typescript
  type CyclePhase = 'menstruation' | 'follicular' | 'ovulation' | 'luteal'

  type PhaseInfo = {
    phase: CyclePhase
    dayInPhase: number
    totalDaysInPhase: number
    energyLevel: number        // 0-100
    focusType: string          // e.g. "creative", "analytical", "social", "rest"
    description: string
  }

  type UserProfile = {
    cycleLength: number        // typically 21-35 days
    lastPeriodStart: string    // ISO date
    location: { lat: number; lng: number } | null
    calendarConnected: boolean
  }

  type CalendarEvent = {
    id: string
    title: string
    startTime: string
    endTime: string
    energyDemand: 'low' | 'medium' | 'high'
    rhythmScore: number        // 0-100
    phaseAtTime: CyclePhase
  }

  type RhythmScore = {
    overall: number            // 0-100
    cycleAlignment: number
    lunarAlignment: number
    seasonalAlignment: number
    suggestion: string | null
  }
  ```
- [x] Create Zustand store (`lib/store.ts`) for user profile + events

---

## Phase 1: Cycle Engine

**Time: ~1.5 hrs**

Build as pure functions in `lib/engine/` — no UI, fully testable.

- [x] `lib/engine/menstrual.ts` — Menstrual cycle calculator
  - `getCurrentPhase(lastPeriodStart, cycleLength, targetDate)` → `PhaseInfo`
  - `getPhaseForDateRange(start, end, profile)` → `PhaseInfo[]`
  - Phase breakdown (for default 28-day cycle):
    - Menstruation: days 1-5
    - Follicular: days 6-13
    - Ovulation: days 14-16
    - Luteal: days 17-28
  - Scale proportionally for non-28-day cycles

- [x] `lib/engine/lunar.ts` — Lunar phase calculator
  - `getLunarPhase(date)` → `{ phase, illumination, name }`
  - Pure math based on synodic period (29.53 days from known new moon epoch)
  - Phases: new moon, waxing crescent, first quarter, waxing gibbous, full moon, waning gibbous, last quarter, waning crescent

- [x] `lib/engine/seasonal.ts` — Seasonal energy engine
  - `getSeason(date, latitude)` → `{ season, energy, description }`
  - `getDaylightHours(date, lat, lng)` → hours of daylight
  - Account for hemisphere (southern = opposite seasons)
  - Energy mapping: spring=growth, summer=peak, autumn=harvest, winter=rest

- [x] `lib/engine/score.ts` — Rhythm Score calculator
  - `scoreEvent(event, date, userProfile)` → `RhythmScore` (0-100)
  - Weights: cycle alignment 50%, seasonal 30%, lunar 20%
  - High-energy events score well in follicular/ovulation, poorly in menstruation
  - Low-energy events score well in luteal/menstruation

- [x] `lib/engine/suggest.ts` — Rescheduling suggester
  - `suggestReschedule(event, userProfile, windowDays)` → `{ suggestedDate, score, reasoning }`
  - Scan ±7 days, return date with highest rhythm score
  - Generate human-readable reasoning string

---

## Phase 2: Core Screens — Today & Week

**Time: ~2.5 hrs**

### Today Screen (`app/(tabs)/index.tsx`)

- [x] Phase banner at top:
  - Current phase name + icon (crescent/waxing/full/waning moon)
  - Phase color gradient background
  - "Day X of Y" indicator
  - Energy description: "Rest & reflect" / "Rising energy — great for learning" / etc.
- [x] Rhythm score ring (circular, like the health score in the inspo):
  - Large centered number (0-100)
  - Ring colored by score (green/orange/red)
  - "Your day's alignment" label
- [x] Today's events list:
  - Cards on `bg-surface` with left color border (alignment color)
  - Event title, time, small score badge
  - Tap → bottom sheet with alignment breakdown
- [x] Bottom sheet (event detail):
  - Cycle alignment bar
  - Lunar alignment bar
  - Seasonal alignment bar
  - Rescheduling suggestion with reasoning (if score < 50)

### Week Screen (`app/(tabs)/week.tsx`)

- [x] Horizontal scrollable day columns
- [x] Phase gradient band across the top (shows cycle phase flowing across the week)
- [x] Lunar phase icon row beneath
- [x] Events as rounded pill cards within each day column
- [x] Color-coded by alignment score
- [x] Weekly rhythm score summary at bottom
- [x] Tap event → same bottom sheet as Today

---

## Phase 3: Wheel View — The Showstopper

**Time: ~2.5 hrs**

### Wheel Screen (`app/(tabs)/wheel.tsx`)

Built with `react-native-svg` on dark canvas.

- [x] Outer ring: 12 months, seasonal color gradient
  - Spring (growth): slate blue fading to warm
  - Summer (peak): warm orange
  - Autumn (harvest): wine/tuscan red
  - Winter (rest): deep red/blood
- [x] Middle ring: lunar phase dots
  - Small circles repeating the ~29.5 day pattern
  - Filled proportional to illumination
- [x] Inner ring: menstrual cycle arcs
  - Colored arcs repeating per cycle length
  - Each arc segment colored by phase
- [x] Center: today's summary
  - Current date
  - Phase icon (celestial illustration style)
  - Rhythm score number
- [x] Interaction:
  - Tap a segment → zoom to that week (animate with reanimated)
  - Pinch to zoom between month/year views

### Simplified v1 (if time is tight)

- [x] Static SVG with current month only (not full year)
- [x] No zoom interaction, just visual display
- [x] Still has all three rings + center info
- [x] This alone is demo-worthy

---

## Phase 4: Google Calendar Integration

**Time: ~1.5 hrs**

- [x] Google OAuth flow via `expo-auth-session`
  - Register OAuth client in Google Cloud Console (do this first!)
  - Scopes: `calendar.readonly`
- [x] Fetch events for current week from Google Calendar REST API
- [x] Map events to `CalendarEvent` type:
  - Default energy demand: `medium`
  - User can swipe/tap to adjust to `low` or `high`
- [x] Compute rhythm scores for all fetched events
- [x] Cache events in AsyncStorage (don't re-fetch constantly)
- [x] **Demo mode fallback** (critical):
  - 10 pre-seeded events with intentional misalignments
  - Toggle in profile: "Use demo data"
  - This is your safety net if OAuth breaks at the hackathon

---

## Phase 5: Smart Nudges & Suggestions

**Time: ~1 hr**

- [x] Misalignment nudge card:
  - Appears on Today screen when an event scores < 40
  - "This high-energy networking event falls during your menstrual phase"
  - "Your energy peaks next Thursday during your follicular phase — consider moving it?"
  - One-tap "View suggestion" → opens date picker pre-filled with suggested date
- [x] Rescheduling flow:
  - Show comparison: current date score vs suggested date score
  - Reasoning breakdown (which phase, why it's better)
  - "Reschedule" button (in v1: just opens native calendar app to that date)
- [x] Daily insight card on Today screen:
  - "Today is a full moon — good for completing projects and celebrating wins"
  - "You're entering your follicular phase — schedule that brainstorm this week"
  - Rotate through cycle / lunar / seasonal insights

---

## Phase 6: Onboarding & Profile

**Time: ~1 hr**

### Onboarding Flow (`app/onboarding/`)

- [x] Welcome screen: full-screen dark background, SVG crescent moon icon, serif headline: "Plan around the rhythms your body follows"
- [x] Cycle input screen: cycle length stepper (21-35, default 28), last period date picker, option to skip ("I don't track a cycle")
- [x] Calendar screen: demo data toggle with explanation text
- [x] Location screen: permission request for seasonal data, explain why it's needed

### Profile Screen (`app/(tabs)/profile.tsx`)

- [x] Edit cycle length + last period date
- [x] Toggle Google Calendar connection
- [x] Toggle demo mode
- [x] Current location display + re-request
- [x] Phase reference guide (what each phase means)

---

## Phase 7: Demo Polish

**Time: ~1 hr**

- [x] Seed compelling demo data:
  - 10 events across Feb 17–22, mix of aligned + misaligned
  - "Networking Happy Hour" (high energy, luteal) triggers NudgeCard
  - "Code Review & Bug Triage" (low energy, luteal) scores high
  - Contrast obvious across today/wheel/week views
- [x] Smooth screen transitions (slide_from_right onboarding, slide_from_bottom modal)
- [x] Haptic feedback on score ring render, event tap, and sheet open (`expo-haptics`)
- [x] App icon SVG (dark background, crescent moon in deep red)
- [x] Splash screen (brand mark, dark)
- [ ] Test on physical device via Expo Go
- [ ] Practice the pitch flow: onboarding → today → wheel → nudge → reschedule

---

## Cut List (If Short on Time)

Priority of what to protect vs cut:

| Priority   | Feature                          | Notes                              |
|------------|----------------------------------|------------------------------------|
| PROTECT    | Today screen + rhythm score ring | Core demo moment                   |
| PROTECT    | Wheel view (even static SVG)     | Visual wow factor for judges       |
| PROTECT    | One rescheduling nudge           | The "aha" moment                   |
| PROTECT    | Demo mode with seeded data       | Safety net for live demo           |
| CUT LAST   | Week view                        | Nice but Today + Wheel is enough   |
| CUT FIRST  | Google Calendar OAuth            | Demo data works fine               |
| CUT FIRST  | Animated wheel zoom              | Static wheel still impresses       |
| CUT FIRST  | Haptics + transitions            | Polish, not substance              |

---

## File Structure (Final)

```
rhythm/
  app/
    (tabs)/
      _layout.tsx
      index.tsx              # Today screen
      week.tsx               # Week view
      wheel.tsx              # Wheel view
      profile.tsx            # Profile & settings
    onboarding/
      _layout.tsx
      index.tsx              # Welcome
      cycle.tsx              # Cycle input
      calendar.tsx           # Calendar connect
      location.tsx           # Location permission
    _layout.tsx              # Root layout
  lib/
    engine/
      menstrual.ts           # Cycle phase calculator
      lunar.ts               # Lunar phase calculator
      seasonal.ts            # Seasonal energy engine
      score.ts               # Rhythm score calculator
      suggest.ts             # Rescheduling suggestions
      insight.ts             # Daily insight generation
    theme.ts                 # Design tokens & colors
    types.ts                 # TypeScript types
    store.ts                 # Zustand store
    demo-data.ts             # Seeded demo events
    utils.ts                 # Date helpers, formatters
  assets/
    illustrations/           # Celestial SVG illustrations
    fonts/                   # Serif + sans-serif fonts
  components/
    AppIcon.tsx              # SVG crescent moon brand icon
    PhaseBar.tsx             # Phase color gradient banner
    ScoreRing.tsx            # Circular rhythm score + haptic
    EventCard.tsx            # Calendar event card + haptic
    AlignmentSheet.tsx       # Bottom sheet with score breakdown + haptic
    InsightCard.tsx          # Daily cycle/lunar/seasonal insight
    NudgeCard.tsx            # Rescheduling suggestion card
    SegmentedControl.tsx     # Reusable tab control
    WheelChart.tsx           # SVG wheel visualization
    WeekView.tsx             # Week calendar view
    MonthCalendar.tsx        # Month calendar view
    MoonIcon.tsx             # Lunar phase icon component
```
