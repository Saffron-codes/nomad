import { TimerDurations, TimerEvent, TimerState } from "./types";

const toSeconds = (minutes: number): number => minutes * 60;

const resolveSessionSeconds = (
  session: "work" | "break" | null,
  durations: TimerDurations,
): number => {
  if (session === "work") {
    return durations.workUnit === "hours"
      ? toSeconds(durations.workMinutes * 60)
      : toSeconds(durations.workMinutes);
  }
  if (session === "break") {
    return durations.breakUnit === "hours"
      ? toSeconds(durations.breakMinutes * 60)
      : toSeconds(durations.breakMinutes);
  }
  return 0;
};

export const initialTimerState: TimerState = {
  phase: "idle",
  remainingSeconds: 0,
  activeSession: null,
};

export function transitionTimerState(
  state: TimerState,
  event: TimerEvent,
  durations: TimerDurations,
): TimerState {
  switch (event.type) {
    case "START_WORK":
      return {
        phase: "work",
        activeSession: "work",
        remainingSeconds: resolveSessionSeconds("work", durations),
      };
    case "START_BREAK":
      return {
        phase: "break",
        activeSession: "break",
        remainingSeconds: resolveSessionSeconds("break", durations),
      };
    case "PAUSE":
      if (state.phase === "work" || state.phase === "break") {
        return { ...state, phase: "paused" };
      }
      return state;
    case "RESUME":
      if (state.phase === "paused" && state.activeSession) {
        return { ...state, phase: state.activeSession };
      }
      return state;
    case "RESET":
      return initialTimerState;
    case "TICK":
      if (state.phase !== "work" && state.phase !== "break") {
        return state;
      }

      if (state.remainingSeconds > 1) {
        return { ...state, remainingSeconds: state.remainingSeconds - 1 };
      }

      // When a session reaches zero, immediately transition to the opposite session.
      if (state.phase === "work") {
        return {
          phase: "break",
          activeSession: "break",
          remainingSeconds: resolveSessionSeconds("break", durations),
        };
      }

      return {
        phase: "work",
        activeSession: "work",
        remainingSeconds: resolveSessionSeconds("work", durations),
      };
    default:
      return state;
  }
}
