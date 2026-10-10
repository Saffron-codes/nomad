import { useCallback, useMemo } from "react";
import { useTimerStore } from "../stores/timerStore";
import { TauriSettingsStore, type AppSettings } from "../services/settings/settingsStore";

/** Current settings plus a save action. Loading happens once in useTimerEngine. */
export const useSettings = () => {
  const settings = useTimerStore((s) => s.settings);
  const setSettings = useTimerStore((s) => s.setSettings);
  const isLoadingSettings = useTimerStore((s) => s.isLoadingSettings);
  const isSavingSettings = useTimerStore((s) => s.isSavingSettings);
  const setSavingSettings = useTimerStore((s) => s.setSavingSettings);
  const settingsError = useTimerStore((s) => s.settingsError);
  const setSettingsError = useTimerStore((s) => s.setSettingsError);

  const settingsStore = useMemo(() => new TauriSettingsStore(), []);

  const saveSettings = useCallback(
    async (newSettings: AppSettings) => {
      try {
        setSavingSettings(true);
        setSettingsError(null);
        await settingsStore.save(newSettings);
        setSettings(newSettings);
      } catch {
        setSettingsError("We couldn't save your settings. Please try again.");
      } finally {
        setSavingSettings(false);
      }
    },
    [setSettings, setSavingSettings, setSettingsError, settingsStore],
  );

  return { settings, isLoadingSettings, isSavingSettings, settingsError, saveSettings };
};
