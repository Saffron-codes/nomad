import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { initialTimerState, transitionTimerState } from "../core/timer/timerMachine";
import type { TimerState, TimerCommand } from "../core/timer/types";
import { defaultSettings, type AppSettings } from "../services/settings/settingsStore";

interface TimerStore {
  state: TimerState;
  settings: AppSettings;
  isLoadingSettings: boolean;
  isSavingSettings: boolean;
  settingsError: string | null;

  /** Applies a command at `now` (epoch ms), defaulting to the current clock. */
  transition: (command: TimerCommand, now?: number) => void;
  setSettings: (settings: AppSettings) => void;
  setLoadingSettings: (loading: boolean) => void;
  setSavingSettings: (saving: boolean) => void;
  setSettingsError: (error: string | null) => void;
}

export const useTimerStore = create<TimerStore>()(
  devtools(
    (set) => ({
      state: initialTimerState,
      settings: defaultSettings,
      isLoadingSettings: true,
      isSavingSettings: false,
      settingsError: null,

      transition: (command, now = Date.now()) => {
        set((prev) => ({
          state: transitionTimerState(prev.state, { ...command, now }, prev.settings),
        }));
      },
      setSettings: (settings) => set({ settings }),
      setLoadingSettings: (loading) => set({ isLoadingSettings: loading }),
      setSavingSettings: (saving) => set({ isSavingSettings: saving }),
      setSettingsError: (error) => set({ settingsError: error }),
    }),
    { name: "timer-store" },
  ),
);
