import { NavLink } from "react-router";
import { Info, SlidersHorizontal } from "lucide-react";
import { AppHeader } from "../components/AppHeader";
import { TimerDisplay } from "../components/ui/TimerDisplay";
import { TimerSettings } from "../components/ui/TimerSettings";
import { SettingsStatus } from "../components/SettingsStatus";
import { useTimer } from "../hooks/useTimer";
import { useSettings } from "../hooks/useSettings";
import { useDraftSettings } from "../hooks/useDraftSettings";
import { parseDurationInput, toSeconds, validateDuration } from "../utils/timerUtils";

const navLinkClasses =
  "inline-flex items-center gap-2 rounded-lg border border-white/15 bg-nomad-surface-muted px-4 py-2 text-sm font-medium text-nomad-text transition hover:border-nomad-brand hover:bg-nomad-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nomad-brand";

export function HomePage() {
  const { timerState, startTimer, pauseTimer, resumeTimer, resetTimer } = useTimer();
  const { settings, isLoadingSettings, isSavingSettings, settingsError, saveSettings } =
    useSettings();
  const { draftSettings, updateDraft, revertDraft, validationError, setValidationError } =
    useDraftSettings(settings);

  const hasUnsavedSettings =
    draftSettings.workMinutes !== settings.workMinutes ||
    draftSettings.breakMinutes !== settings.breakMinutes;

  const applySettings = async () => {
    const error =
      validateDuration("Work time", draftSettings.workMinutes, draftSettings.workUnit) ??
      validateDuration("Break time", draftSettings.breakMinutes, draftSettings.breakUnit);
    setValidationError(error);
    if (error) return;
    await saveSettings(draftSettings);
  };

  const updateDraftWorkMinutes = (value: string) =>
    updateDraft({ workMinutes: parseDurationInput(value, draftSettings.workMinutes) });

  const updateDraftBreakMinutes = (value: string) =>
    updateDraft({ breakMinutes: parseDurationInput(value, draftSettings.breakMinutes) });

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center px-6 py-10">
      <section className="w-full rounded-2xl border border-white/10 bg-nomad-surface/80 p-8 shadow-2xl backdrop-blur-sm">
        <AppHeader />

        <TimerDisplay
          timerState={timerState}
          plannedSeconds={toSeconds(settings.workMinutes, settings.workUnit)}
          onStart={startTimer}
          onPause={pauseTimer}
          onResume={resumeTimer}
          onReset={resetTimer}
          isLoadingSettings={isLoadingSettings}
        />

        <TimerSettings
          draftSettings={draftSettings}
          isLoadingSettings={isLoadingSettings}
          isSavingSettings={isSavingSettings}
          hasUnsavedSettings={hasUnsavedSettings}
          errorMessage={validationError ?? settingsError}
          onWorkMinutesChange={updateDraftWorkMinutes}
          onBreakMinutesChange={updateDraftBreakMinutes}
          onSave={() => void applySettings()}
          onRevert={revertDraft}
        />

        <SettingsStatus isLoadingSettings={isLoadingSettings} settings={settings} />

        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <NavLink to="/settings" className={navLinkClasses}>
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            <span>More settings</span>
          </NavLink>
          <NavLink to="/story" className={navLinkClasses}>
            <Info className="h-4 w-4" aria-hidden="true" />
            <span>About Nomad</span>
          </NavLink>
        </div>
      </section>
    </main>
  );
}
