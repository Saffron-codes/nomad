import type { TimerPhase } from "../core/timer/types";

export type DurationUnit = "minutes" | "hours";

/** Allowed range for a session length, per unit. */
export const DURATION_LIMITS: Record<DurationUnit, { min: number; max: number }> = {
  minutes: { min: 1, max: 240 },
  hours: { min: 1, max: 12 },
};

const pad = (value: number): string => value.toString().padStart(2, "0");

/** Formats seconds as MM:SS, or H:MM:SS once the value reaches an hour. */
export const formatTime = (totalSeconds: number): string => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
};

export const parseDurationInput = (value: string, previousValue: number): number => {
  if (value.trim() === "") {
    return 0;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return previousValue;
  }
  return Math.round(parsed);
};

/** Returns a plain-language error, or null when the value is acceptable. */
export const validateDuration = (
  label: string,
  value: number,
  unit: DurationUnit,
): string | null => {
  const { min, max } = DURATION_LIMITS[unit];
  if (!Number.isFinite(value) || value < min || value > max) {
    return `${label} must be between ${min} and ${max} ${unit}.`;
  }
  return null;
};

/** "1 minute", "25 minutes", "2 hours" */
export const describeDuration = (value: number, unit: DurationUnit): string => {
  const singular = unit === "hours" ? "hour" : "minute";
  return `${value} ${value === 1 ? singular : unit}`;
};

/** Adjective form for use before a noun: "a 10-minute break", "a 2-hour break". */
export const describeDurationAsAdjective = (value: number, unit: DurationUnit): string =>
  `${value}-${unit === "hours" ? "hour" : "minute"}`;

export const toSeconds = (value: number, unit: DurationUnit): number =>
  unit === "hours" ? value * 3600 : value * 60;

export const getPhaseLabel = (phase: TimerPhase): string => {
  const phaseLabels: Record<TimerPhase, string> = {
    idle: "Ready when you are",
    work: "Work time",
    break: "Break time",
    paused: "Paused",
  };
  return phaseLabels[phase];
};
