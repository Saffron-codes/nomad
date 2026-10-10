import { useState } from "react";
import type { AppSettings } from "../services/settings/settingsStore";

/**
 * Local, editable copy of the saved settings. Whenever the saved settings
 * change (initial load, a save, or a save from another page), the draft is
 * reset to match and any validation message is cleared.
 */
export const useDraftSettings = (settings: AppSettings) => {
  const [draftSettings, setDraftSettings] = useState(settings);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [syncedSettings, setSyncedSettings] = useState(settings);

  if (syncedSettings !== settings) {
    setSyncedSettings(settings);
    setDraftSettings(settings);
    setValidationError(null);
  }

  const updateDraft = (patch: Partial<AppSettings>) => {
    setValidationError(null);
    setDraftSettings((previous) => ({ ...previous, ...patch }));
  };

  const revertDraft = () => {
    setDraftSettings(settings);
    setValidationError(null);
  };

  return { draftSettings, updateDraft, revertDraft, validationError, setValidationError };
};
