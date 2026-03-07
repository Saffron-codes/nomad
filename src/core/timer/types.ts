export type TimerPhase = "idle" | "work" | "break" | "paused";

export interface TimerDurations {
  workMinutes: number;
  breakMinutes: number;
}

export interface TimerState {
  phase: TimerPhase;
  remainingSeconds: number;
  activeSession: "work" | "break" | null;
}

export type TimerEvent =
  | { type: "START_WORK"; durations: TimerDurations }
  | { type: "START_BREAK"; durations: TimerDurations }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "RESET" }
  | { type: "TICK" };
