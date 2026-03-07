import { useEffect, useMemo, useState } from "react";
import { initialTimerState } from "./core/timer/timerMachine";
import { theme } from "./config/theme";
import { BrowserNotificationService } from "./services/notifications/notificationService";
import {
  defaultSettings,
  TauriSettingsStore,
  type AppSettings,
} from "./services/settings/settingsStore";
import { NoopTrayService } from "./services/tray/trayService";

function App() {
  const settingsStore = useMemo(() => new TauriSettingsStore(), []);
  const notificationService = useMemo(() => new BrowserNotificationService(), []);
  const trayService = useMemo(() => new NoopTrayService(), []);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  void notificationService;
  void trayService;

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        const loaded = await settingsStore.load();
        if (isMounted) setSettings(loaded);
      } finally {
        if (isMounted) setIsLoadingSettings(false);
      }
    };

    void loadSettings();
    return () => {
      isMounted = false;
    };
  }, [settingsStore]);

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center px-6 py-10">
      <section className="w-full rounded-2xl border border-white/10 bg-nomad-surface/80 p-8 shadow-2xl backdrop-blur-sm">
        <p className="text-sm font-medium text-nomad-brand">Phase 2 Scaffold</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-nomad-text">
          Nomad architecture is ready for timer implementation.
        </h1>
        <p className="mt-3 text-nomad-text-muted">
          Theme: {theme.name}. Core modules for timer, settings, notifications, and
          tray integration are now in place.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-white/10 bg-nomad-surface-muted/70 p-4">
            <p className="text-xs uppercase tracking-wide text-nomad-text-muted">
              Default Work Duration
            </p>
            <p className="mt-1 text-2xl font-semibold text-nomad-text">
              {settings.workMinutes} min
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-nomad-surface-muted/70 p-4">
            <p className="text-xs uppercase tracking-wide text-nomad-text-muted">
              Default Break Duration
            </p>
            <p className="mt-1 text-2xl font-semibold text-nomad-text">
              {settings.breakMinutes} min
            </p>
          </article>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-black/15 p-4">
          <p className="text-xs text-nomad-text-muted">
            Settings source: {isLoadingSettings ? "Loading store..." : "Tauri Store"}
          </p>
          <p className="text-xs uppercase tracking-wide text-nomad-text-muted">
            Timer Baseline
          </p>
          <p className="mt-1 text-sm text-nomad-text">
            Initial phase: <span className="font-medium">{initialTimerState.phase}</span>
            {" | "}
            Remaining:{" "}
            <span className="font-medium">{initialTimerState.remainingSeconds}s</span>
          </p>
        </div>
      </section>
    </main>
  );
}

export default App;
