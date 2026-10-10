import type { AppSettings } from "../services/settings/settingsStore";
import { describeDuration, describeDurationAsAdjective } from "../utils/timerUtils";

type SettingsStatusProps = {
  isLoadingSettings: boolean;
  settings: AppSettings;
};

export function SettingsStatus({ isLoadingSettings, settings }: SettingsStatusProps) {
  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-black/15 p-4">
      <p className="text-sm text-nomad-text-muted">
        {isLoadingSettings
          ? "Loading your saved routine…"
          : `Your routine: ${describeDuration(settings.workMinutes, settings.workUnit)} of work, then a ${describeDurationAsAdjective(settings.breakMinutes, settings.breakUnit)} break. This repeats until you stop it.`}
      </p>
    </div>
  );
}
