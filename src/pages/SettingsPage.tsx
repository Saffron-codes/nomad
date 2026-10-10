import { ArrowLeft, Check, Undo2 } from "lucide-react";
import { Button, Input, LinkButton, UnitSelector } from "../components/ui";
import { useSettings } from "../hooks/useSettings";
import { useDraftSettings } from "../hooks/useDraftSettings";
import {
  DURATION_LIMITS,
  describeDuration,
  describeDurationAsAdjective,
  parseDurationInput,
  validateDuration,
  type DurationUnit,
} from "../utils/timerUtils";

export function SettingsPage() {
  const { settings, isLoadingSettings, isSavingSettings, settingsError, saveSettings } =
    useSettings();
  const { draftSettings, updateDraft, revertDraft, validationError, setValidationError } =
    useDraftSettings(settings);

  const busy = isLoadingSettings || isSavingSettings;

  const hasUnsavedSettings =
    draftSettings.workMinutes !== settings.workMinutes ||
    draftSettings.breakMinutes !== settings.breakMinutes ||
    draftSettings.workUnit !== settings.workUnit ||
    draftSettings.breakUnit !== settings.breakUnit;

  const applySettings = async () => {
    const error =
      validateDuration("Work time", draftSettings.workMinutes, draftSettings.workUnit) ??
      validateDuration("Break time", draftSettings.breakMinutes, draftSettings.breakUnit);
    setValidationError(error);
    if (error) return;
    await saveSettings(draftSettings);
  };

  const workLimits = DURATION_LIMITS[draftSettings.workUnit];
  const breakLimits = DURATION_LIMITS[draftSettings.breakUnit];
  const errorMessage = validationError ?? settingsError;

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center px-6 py-10">
      <section className="w-full rounded-2xl border border-white/10 bg-nomad-surface/80 p-8 shadow-2xl backdrop-blur-sm">
        <div className="mb-8">
          <LinkButton to="/" variant="secondary" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Back
          </LinkButton>
          <h1 className="text-2xl font-semibold tracking-tight text-nomad-text">
            Settings
          </h1>
          <p className="mt-2 text-nomad-text-muted">
            Choose how long you want to work and how long to rest. You can count each one
            in minutes or hours.
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4 rounded-xl border border-white/10 bg-black/15 p-5">
              <h2 className="text-lg font-medium text-nomad-text">Work</h2>
              <Input
                label="How long"
                type="number"
                min={workLimits.min}
                max={workLimits.max}
                value={draftSettings.workMinutes}
                onChange={(value) =>
                  updateDraft({
                    workMinutes: parseDurationInput(value, draftSettings.workMinutes),
                  })
                }
                disabled={busy}
              />
              <UnitSelector
                value={draftSettings.workUnit}
                onChange={(workUnit: DurationUnit) => updateDraft({ workUnit })}
                disabled={busy}
              />
            </div>

            <div className="space-y-4 rounded-xl border border-white/10 bg-black/15 p-5">
              <h2 className="text-lg font-medium text-nomad-text">Break</h2>
              <Input
                label="How long"
                type="number"
                min={breakLimits.min}
                max={breakLimits.max}
                value={draftSettings.breakMinutes}
                onChange={(value) =>
                  updateDraft({
                    breakMinutes: parseDurationInput(value, draftSettings.breakMinutes),
                  })
                }
                disabled={busy}
              />
              <UnitSelector
                value={draftSettings.breakUnit}
                onChange={(breakUnit: DurationUnit) => updateDraft({ breakUnit })}
                disabled={busy}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-nomad-text-muted">
              {isLoadingSettings
                ? "Loading your saved routine…"
                : `Saved routine: ${describeDuration(settings.workMinutes, settings.workUnit)} of work, then a ${describeDurationAsAdjective(settings.breakMinutes, settings.breakUnit)} break.`}
            </p>

            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={() => void applySettings()}
                disabled={busy || !hasUnsavedSettings}
              >
                <Check className="mr-2 h-4 w-4" aria-hidden="true" />
                {isSavingSettings ? "Saving…" : "Save"}
              </Button>
              <Button
                variant="ghost"
                onClick={revertDraft}
                disabled={!hasUnsavedSettings || isSavingSettings}
              >
                <Undo2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Undo changes
              </Button>
            </div>
          </div>

          {errorMessage && (
            <div
              className="rounded-lg border border-red-300/20 bg-red-500/10 p-4"
              role="alert"
            >
              <p className="text-sm text-red-300">{errorMessage}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
