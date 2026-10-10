import { useCallback } from "react";
import { useTimerStore } from "../stores/timerStore";

/** Read-only timer state plus the user-facing controls. No side effects. */
export const useTimer = () => {
  const timerState = useTimerStore((s) => s.state);
  const transition = useTimerStore((s) => s.transition);

  const startTimer = useCallback(() => transition({ type: "START_WORK" }), [transition]);
  const pauseTimer = useCallback(() => transition({ type: "PAUSE" }), [transition]);
  const resumeTimer = useCallback(() => transition({ type: "RESUME" }), [transition]);
  const resetTimer = useCallback(() => transition({ type: "RESET" }), [transition]);

  return { timerState, startTimer, pauseTimer, resumeTimer, resetTimer };
};
