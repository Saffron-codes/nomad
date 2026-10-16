import type { SessionType, TimerConfig, TimerEvent, TimerState } from "./types";

/**
 * A gap between two clock readings longer than this means the computer was
 * asleep or the app was suspended. Normal ticks arrive about a second apart.
 */
export const SLEEP_GAP_MS = 10_000;

const sessionSeconds = (session: SessionType, config: TimerConfig): number => {
  const value = session === "work" ? config.workMinutes : config.breakMinutes;
  const unit = session === "work" ? config.workUnit : config.breakUnit;
  return unit === "hours" ? value * 3600 : value * 60;
};

const opposite = (session: SessionType): SessionType =>
  session === "work" ? "break" : "work";

const secondsUntil = (endsAt: number, now: number): number =>
  Math.max(0, Math.ceil((endsAt - now) / 1000));

export const initialTimerState: TimerState = {
  phase: "idle",
  remainingSeconds: 0,
  activeSession: null,
  endsAt: null,
  lastTickAt: null,
  completedSessions: 0,
};

const startSession = (
  session: SessionType,
  now: number,
  config: TimerConfig,
): TimerState => {
  const seconds = sessionSeconds(session, config);
  return {
    phase: session,
    activeSession: session,
    remainingSeconds: seconds,
    endsAt: now + seconds * 1000,
    lastTickAt: now,
    completedSessions: 0,
  };
};

/**
 * Applies a clock reading to a running session. Remaining time is always
 * derived from the end timestamp, so it stays correct no matter how late or
 * how bunched-up the ticks arrive.
 */
const tick = (state: TimerState, now: number, config: TimerConfig): TimerState => {
  if ((state.phase !== "work" && state.phase !== "break") || state.endsAt === null) {
    return state;
  }

  let endsAt = state.endsAt;
  if (state.lastTickAt !== null) {
    const gap = now - state.lastTickAt;
    if (config.pauseOnSleep && gap > SLEEP_GAP_MS) {
      // Treat the time asleep as if it never happened.
      endsAt += gap;
    }
  }

  // Roll through any sessions that ended while we were not looking.
  let phase: SessionType = state.phase;
  let completedSessions = state.completedSessions;
  while (endsAt <= now) {
    phase = opposite(phase);
    completedSessions += 1;
    endsAt += sessionSeconds(phase, config) * 1000;
  }

  return {
    phase,
    activeSession: phase,
    remainingSeconds: secondsUntil(endsAt, now),
    endsAt,
    lastTickAt: now,
    completedSessions,
  };
};

export function transitionTimerState(
  state: TimerState,
  event: TimerEvent,
  config: TimerConfig,
): TimerState {
  switch (event.type) {
    case "START_WORK":
      return startSession("work", event.now, config);
    case "START_BREAK":
      return startSession("break", event.now, config);
    case "PAUSE":
      if ((state.phase !== "work" && state.phase !== "break") || state.endsAt === null) {
        return state;
      }
      return {
        ...state,
        phase: "paused",
        remainingSeconds: secondsUntil(state.endsAt, event.now),
        endsAt: null,
        lastTickAt: null,
      };
    case "RESUME":
      if (state.phase !== "paused" || !state.activeSession) {
        return state;
      }
      return {
        ...state,
        phase: state.activeSession,
        endsAt: event.now + state.remainingSeconds * 1000,
        lastTickAt: event.now,
      };
    case "RESET":
      return initialTimerState;
    case "TICK":
      return tick(state, event.now, config);
    default:
      return state;
  }
}
