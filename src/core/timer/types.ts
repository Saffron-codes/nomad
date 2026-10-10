export type TimerPhase = "idle" | "work" | "break" | "paused";

export interface TimerDurations {
  workMinutes: number;
  breakMinutes: number;
  workUnit: "minutes" | "hours";
  breakUnit: "minutes" | "hours";
}

export interface TimerState {
  phase: TimerPhase;
  remainingSeconds: number;
  activeSession: "work" | "break" | null;
}

export type TimerEvent =
  | { type: "START_WORK" }
  | { type: "START_BREAK" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "RESET" }
  | { type: "TICK" };
