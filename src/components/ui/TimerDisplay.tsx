import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "./Button";
import type { TimerState } from "../../core/timer/types";
import { formatTime, getPhaseLabel } from "../../utils/timerUtils";

interface TimerDisplayProps {
  timerState: TimerState;
  /** Length of the next work session, shown while nothing is running. */
  plannedSeconds: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  isLoadingSettings: boolean;
}

export const TimerDisplay = ({
  timerState,
  plannedSeconds,
  onStart,
  onPause,
  onResume,
  onReset,
  isLoadingSettings,
}: TimerDisplayProps) => {
  const { phase, remainingSeconds, activeSession } = timerState;
  const isRunning = phase === "work" || phase === "break";
  const isIdle = phase === "idle";

  const phaseText =
    phase === "paused" && activeSession
      ? `${getPhaseLabel(activeSession)} (paused)`
      : getPhaseLabel(phase);

  const displaySeconds = isIdle ? plannedSeconds : remainingSeconds;
  const accent = phase === "break" ? "text-emerald-300" : "text-nomad-text";

  return (
    <div className="mt-8 rounded-xl border border-white/10 bg-black/15 p-5">
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-nomad-text-muted">
            {isIdle ? "Next up" : "Right now"}
          </p>
          <p className="mt-1 text-xl font-semibold text-nomad-text">{phaseText}</p>
        </div>

        <div
          className={`text-6xl font-semibold tabular-nums tracking-tight ${accent}`}
          aria-live="polite"
          aria-label={isIdle ? "Planned work time" : "Time remaining"}
        >
          {formatTime(displaySeconds)}
        </div>

        <div className="flex flex-wrap gap-3">
          {isIdle && (
            <Button variant="primary" onClick={onStart} disabled={isLoadingSettings}>
              <Play className="mr-2 h-4 w-4" aria-hidden="true" />
              Start working
            </Button>
          )}

          {isRunning && (
            <Button variant="secondary" onClick={onPause}>
              <Pause className="mr-2 h-4 w-4" aria-hidden="true" />
              Pause
            </Button>
          )}

          {phase === "paused" && (
            <Button variant="primary" onClick={onResume}>
              <Play className="mr-2 h-4 w-4" aria-hidden="true" />
              Resume
            </Button>
          )}

          {!isIdle && (
            <Button variant="ghost" onClick={onReset}>
              <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
              Stop and reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
