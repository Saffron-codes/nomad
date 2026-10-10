import { load, type Store } from "@tauri-apps/plugin-store";

export interface AppSettings {
  workMinutes: number;
  breakMinutes: number;
  workUnit: "minutes" | "hours";
  breakUnit: "minutes" | "hours";
}

const STORE_FILE = "settings.json";
const SETTINGS_KEY = "settings";

export const defaultSettings: AppSettings = {
  workMinutes: 50,
  breakMinutes: 10,
  workUnit: "minutes",
  breakUnit: "minutes",
};

export interface SettingsStore {
  load(): Promise<AppSettings>;
  save(settings: AppSettings): Promise<void>;
}

const isValidSettings = (value: unknown): value is AppSettings => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AppSettings>;
  return (
    typeof candidate.workMinutes === "number" &&
    typeof candidate.breakMinutes === "number" &&
    (candidate.workUnit === "minutes" || candidate.workUnit === "hours") &&
    (candidate.breakUnit === "minutes" || candidate.breakUnit === "hours")
  );
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
    const persisted = await store.get<AppSettings>(SETTINGS_KEY);
    if (isValidSettings(persisted)) {
      return persisted;
    }
    return defaultSettings;
  }

  async save(settings: AppSettings): Promise<void> {
    if (!isValidSettings(settings)) {
      return;
    }

    const store = await this.getStore();
    await store.set(SETTINGS_KEY, settings);
    await store.save();
  }
}
