import { useEffect, useMemo, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import { useTimerStore } from "../stores/timerStore";
import { TauriNotificationService } from "../services/notifications/notificationService";
import { TauriTrayService, type TrayAction } from "../services/tray/trayService";
import { TauriSettingsStore } from "../services/settings/settingsStore";
import { describeDuration } from "../utils/timerUtils";

/**
 * Runs the timer's side effects: ticking, notifications, tray updates, tray
 * menu actions, and the initial settings load. Mount this exactly once, at the
 * app root, so the timer keeps running no matter which page is open.
 */
export const useTimerEngine = () => {
  const phase = useTimerStore((s) => s.state.phase);
  const remainingSeconds = useTimerStore((s) => s.state.remainingSeconds);
  const settings = useTimerStore((s) => s.settings);
  const transition = useTimerStore((s) => s.transition);
  const setSettings = useTimerStore((s) => s.setSettings);
  const setLoadingSettings = useTimerStore((s) => s.setLoadingSettings);
  const setSettingsError = useTimerStore((s) => s.setSettingsError);

  const notificationService = useMemo(() => new TauriNotificationService(), []);
  const trayService = useMemo(() => new TauriTrayService(), []);
  const settingsStore = useMemo(() => new TauriSettingsStore(), []);
  const previousPhaseRef = useRef(phase);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // Load saved settings once at startup.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingSettings(true);
        const loaded = await settingsStore.load();
        if (!cancelled) setSettings(loaded);
      } catch {
        if (!cancelled)
          setSettingsError(
            "We couldn't load your saved settings, so the defaults are being used.",
          );
      } finally {
        if (!cancelled) setLoadingSettings(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [settingsStore, setSettings, setLoadingSettings, setSettingsError]);

  useEffect(() => {
    void trayService.init();
  }, [trayService]);

  // Notify when a session ends and the next one begins.
  useEffect(() => {
    const previousPhase = previousPhaseRef.current;
    const current = settingsRef.current;

    if (previousPhase === "work" && phase === "break") {
      void notificationService.notify({
        title: "Time for a break",
        body: `Nice work. Take ${describeDuration(current.breakMinutes, current.breakUnit)} to rest.`,
      });
    }

    if (previousPhase === "break" && phase === "work") {
      void notificationService.notify({
        title: "Break's over",
        body: `Time to get back to it for ${describeDuration(current.workMinutes, current.workUnit)}.`,
      });
    }

    previousPhaseRef.current = phase;
  }, [notificationService, phase]);

  useEffect(() => {
    void trayService.setSnapshot({ status: phase, remainingSeconds });
  }, [phase, remainingSeconds, trayService]);

  // Tray menu actions arrive from the Rust side as a "tray-action" event.
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let disposed = false;

    void listen<TrayAction>("tray-action", (event) => {
      switch (event.payload) {
        case "start":
          transition({ type: "START_WORK" });
          break;
        case "pause":
          transition({ type: "PAUSE" });
          break;
        case "resume":
          transition({ type: "RESUME" });
          break;
        case "reset":
          transition({ type: "RESET" });
          break;
      }
    })
      .then((fn) => {
        if (disposed) fn();
        else unlisten = fn;
      })
      .catch((error) => console.warn("Could not listen for tray actions:", error));

    return () => {
      disposed = true;
      unlisten?.();
    };
  }, [transition]);

  useEffect(() => {
    if (phase !== "work" && phase !== "break") return;
    const intervalId = window.setInterval(() => transition({ type: "TICK" }), 1000);
    return () => window.clearInterval(intervalId);
  }, [phase, transition]);
};
