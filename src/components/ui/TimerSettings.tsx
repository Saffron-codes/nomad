import { Check, Undo2 } from "lucide-react";
import { Button } from "./Button";
import { Input } from "./Input";
import type { AppSettings } from "../../services/settings/settingsStore";
import { DURATION_LIMITS } from "../../utils/timerUtils";

interface TimerSettingsProps {
  draftSettings: AppSettings;
  isLoadingSettings: boolean;
  isSavingSettings: boolean;
  hasUnsavedSettings: boolean;
  errorMessage: string | null;
  onWorkMinutesChange: (value: string) => void;
  onBreakMinutesChange: (value: string) => void;
  onSave: () => void;
  onRevert: () => void;
}

export const TimerSettings = ({
  draftSettings,
  isLoadingSettings,
  isSavingSettings,
  hasUnsavedSettings,
  errorMessage,
  onWorkMinutesChange,
  onBreakMinutesChange,
  onSave,
  onRevert,
}: TimerSettingsProps) => {
  const busy = isLoadingSettings || isSavingSettings;
  const workLimits = DURATION_LIMITS[draftSettings.workUnit];
  const breakLimits = DURATION_LIMITS[draftSettings.breakUnit];

  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-nomad-surface-muted/70 p-5">
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-nomad-text-muted">
            Your routine
          </p>
          <p className="mt-1 text-sm text-nomad-text-muted">
            Choose how long to work and how long to rest. Changes apply to the next
            session.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label={`Work (${draftSettings.workUnit})`}
            type="number"
            min={workLimits.min}
            max={workLimits.max}
            value={draftSettings.workMinutes}
            onChange={onWorkMinutesChange}
            disabled={busy}
          />

          <Input
            label={`Break (${draftSettings.breakUnit})`}
            type="number"
            min={breakLimits.min}
            max={breakLimits.max}
            value={draftSettings.breakMinutes}
            onChange={onBreakMinutesChange}
            disabled={busy}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            onClick={onSave}
            disabled={busy || !hasUnsavedSettings}
          >
            <Check className="mr-2 h-4 w-4" aria-hidden="true" />
            {isSavingSettings ? "Saving…" : "Save"}
          </Button>

          <Button
            variant="ghost"
            onClick={onRevert}
            disabled={!hasUnsavedSettings || isSavingSettings}
          >
            <Undo2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Undo changes
          </Button>
        </div>

        {errorMessage && (
          <p className="text-sm text-red-300" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
};
