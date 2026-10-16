export type TimerPhase = "idle" | "work" | "break" | "paused";
export type SessionType = "work" | "break";

export interface TimerDurations {
  workMinutes: number;
  breakMinutes: number;
  workUnit: "minutes" | "hours";
  breakUnit: "minutes" | "hours";
}

/** Everything the reducer needs from the user's settings. */
export interface TimerConfig extends TimerDurations {
  /** When true, time the computer spends asleep is not counted against the session. */
  pauseOnSleep: boolean;
}

export interface TimerState {
  phase: TimerPhase;
  /** Seconds left in the current session as of the last clock reading. */
  remainingSeconds: number;
  activeSession: SessionType | null;
  /** Epoch milliseconds at which the running session ends. Null unless phase is work or break. */
  endsAt: number | null;
  /** Epoch milliseconds of the last clock reading applied while running. Used to detect sleep. */
  lastTickAt: number | null;
  /** How many sessions have ended on their own since the timer was last started. */
  completedSessions: number;
}

/** What callers ask for. The store stamps each command with the current time. */
export type TimerCommand =
  | { type: "START_WORK" }
  | { type: "START_BREAK" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "RESET" }
  | { type: "TICK" };

/** A command plus the clock reading (epoch milliseconds) it should be applied at. */
export type TimerEvent = TimerCommand & { now: number };
