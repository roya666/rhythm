import type { CalendarEvent } from "./types";

/**
 * Demo events across Feb 17–22, 2026.
 * lastPeriodStart = "2026-02-01", cycleLength = 28
 * → Feb 17 = day 17 (luteal), Feb 21 = day 21 (luteal)
 * Luteal phase: lower energy, analytical focus.
 * Mix of aligned (low-energy) and misaligned (high-energy) events.
 */
export const demoEvents: CalendarEvent[] = [
  // --- Feb 17 (Tue) - luteal day 17 ---
  {
    id: "demo-1",
    title: "Sprint Planning",
    startTime: "2026-02-17T09:00:00",
    endTime: "2026-02-17T10:30:00",
    energyDemand: "high",
    rhythmScore: 0,
    phaseAtTime: "luteal",
  },
  // --- Feb 18 (Wed) - luteal day 18 ---
  {
    id: "demo-2",
    title: "Yoga & Stretching",
    startTime: "2026-02-18T07:00:00",
    endTime: "2026-02-18T07:45:00",
    energyDemand: "low",
    rhythmScore: 0,
    phaseAtTime: "luteal",
  },
  // --- Feb 19 (Thu) - luteal day 19 ---
  {
    id: "demo-3",
    title: "Design Critique Session",
    startTime: "2026-02-19T11:00:00",
    endTime: "2026-02-19T12:00:00",
    energyDemand: "medium",
    rhythmScore: 0,
    phaseAtTime: "luteal",
  },
  // --- Feb 20 (Fri) - luteal day 20 ---
  {
    id: "demo-4",
    title: "All-Hands Presentation",
    startTime: "2026-02-20T14:00:00",
    endTime: "2026-02-20T15:00:00",
    energyDemand: "high",
    rhythmScore: 0,
    phaseAtTime: "luteal",
  },
  // --- Feb 21 (Sat) - luteal day 21 — "today" ---
  {
    id: "demo-5",
    title: "Morning Journaling",
    startTime: "2026-02-21T08:00:00",
    endTime: "2026-02-21T08:30:00",
    energyDemand: "low",
    rhythmScore: 0,
    phaseAtTime: "luteal",
  },
  {
    id: "demo-6",
    title: "Code Review & Bug Triage",
    startTime: "2026-02-21T09:30:00",
    endTime: "2026-02-21T11:00:00",
    energyDemand: "low",
    rhythmScore: 0,
    phaseAtTime: "luteal",
  },
  {
    id: "demo-7",
    title: "1:1 with Manager",
    startTime: "2026-02-21T13:00:00",
    endTime: "2026-02-21T13:30:00",
    energyDemand: "medium",
    rhythmScore: 0,
    phaseAtTime: "luteal",
  },
  {
    id: "demo-8",
    title: "Networking Happy Hour",
    startTime: "2026-02-21T17:30:00",
    endTime: "2026-02-21T19:00:00",
    energyDemand: "high",
    rhythmScore: 0,
    phaseAtTime: "luteal",
  },
  // --- Feb 22 (Sun) - luteal day 22 ---
  {
    id: "demo-9",
    title: "Meal Prep & Batch Cooking",
    startTime: "2026-02-22T10:00:00",
    endTime: "2026-02-22T11:30:00",
    energyDemand: "low",
    rhythmScore: 0,
    phaseAtTime: "luteal",
  },
  {
    id: "demo-10",
    title: "Deep Clean & Organize",
    startTime: "2026-02-22T14:00:00",
    endTime: "2026-02-22T15:30:00",
    energyDemand: "medium",
    rhythmScore: 0,
    phaseAtTime: "luteal",
  },
];
