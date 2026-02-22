import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CalendarEvent, CyclePhase, UserProfile } from "./types";
import { demoEvents } from "./demo-data";

type RhythmState = {
  userProfile: UserProfile;
  events: CalendarEvent[];
  onboardingComplete: boolean;
  demoMode: boolean;
  currentPhase: CyclePhase;
  _hasHydrated: boolean;

  setUserProfile: (profile: Partial<UserProfile>) => void;
  setEvents: (events: CalendarEvent[]) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setDemoMode: (demo: boolean) => void;
  setCurrentPhase: (phase: CyclePhase) => void;
};

export const useRhythmStore = create<RhythmState>()(
  persist(
    (set) => ({
      userProfile: {
        cycleLength: 28,
        lastPeriodStart: "2026-02-01",
        location: null,
        calendarConnected: false,
      },
      events: demoEvents,
      onboardingComplete: false,
      demoMode: false,
      currentPhase: "follicular",
      _hasHydrated: false,

      setUserProfile: (profile) =>
        set((state) => ({ userProfile: { ...state.userProfile, ...profile } })),
      setEvents: (events) => set({ events }),
      setOnboardingComplete: (complete) => set({ onboardingComplete: complete }),
      setDemoMode: (demo) =>
        set({ demoMode: demo, events: demo ? demoEvents : [] }),
      setCurrentPhase: (phase) => set({ currentPhase: phase }),
    }),
    {
      name: "rhythm-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        userProfile: state.userProfile,
        onboardingComplete: state.onboardingComplete,
        demoMode: state.demoMode,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
          if (state.demoMode) {
            state.events = demoEvents;
          }
        }
        useRhythmStore.setState({ _hasHydrated: true });
      },
    }
  )
);
