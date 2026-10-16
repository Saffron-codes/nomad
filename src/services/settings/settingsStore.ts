import { load, type Store } from "@tauri-apps/plugin-store";

export interface AppSettings {
  workMinutes: number;
  breakMinutes: number;
  workUnit: "minutes" | "hours";
  breakUnit: "minutes" | "hours";
  /** Pause the timer while the computer sleeps instead of following the clock. */
  pauseOnSleep: boolean;
}

const STORE_FILE = "settings.json";
const SETTINGS_KEY = "settings";

export const defaultSettings: AppSettings = {
  workMinutes: 50,
  breakMinutes: 10,
  workUnit: "minutes",
  breakUnit: "minutes",
  pauseOnSleep: true,
};

export interface SettingsStore {
  load(): Promise<AppSettings>;
  save(settings: AppSettings): Promise<void>;
}

/**
 * Accepts a settings object written by any released version. Fields added
 * after 1.0.0 fall back to their defaults so older files keep working.
 */
export const normalizeSettings = (value: unknown): AppSettings | null => {
  if (!value || typeof value !== "object") return null;
  const { workMinutes, breakMinutes, workUnit, breakUnit, pauseOnSleep } =
    value as Partial<AppSettings>;

  if (typeof workMinutes !== "number" || typeof breakMinutes !== "number") return null;
  if (workUnit !== "minutes" && workUnit !== "hours") return null;
  if (breakUnit !== "minutes" && breakUnit !== "hours") return null;

  return {
    workMinutes,
    breakMinutes,
    workUnit,
    breakUnit,
    pauseOnSleep:
      typeof pauseOnSleep === "boolean" ? pauseOnSleep : defaultSettings.pauseOnSleep,
  };
};

export class TauriSettingsStore implements SettingsStore {
  private storePromise: Promise<Store> | null = null;

  private getStore(): Promise<Store> {
    this.storePromise ??= load(STORE_FILE, {
      defaults: { [SETTINGS_KEY]: defaultSettings },
      autoSave: 200,
    });
    return this.storePromise;
  }

  async load(): Promise<AppSettings> {
    const store = await this.getStore();
    const persisted = await store.get<unknown>(SETTINGS_KEY);
    return normalizeSettings(persisted) ?? defaultSettings;
  }

  async save(settings: AppSettings): Promise<void> {
    const normalized = normalizeSettings(settings);
    if (!normalized) {
      return;
    }

    const store = await this.getStore();
    await store.set(SETTINGS_KEY, normalized);
    await store.save();
  }
}
