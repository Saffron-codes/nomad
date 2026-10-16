import { useEffect, useMemo, useRef } from "react";
import { listen, type EventCallback } from "@tauri-apps/api/event";
import { useTimerStore } from "../stores/timerStore";
import { TauriNotificationService } from "../services/notifications/notificationService";
import { TauriTrayService, type TrayAction } from "../services/tray/trayService";
import { TauriSettingsStore } from "../services/settings/settingsStore";
import { describeDuration } from "../utils/timerUtils";

/** Emitted once a second by the Rust side with the current epoch milliseconds. */
const TICK_EVENT = "timer-tick";
/** Emitted by the Rust side when a tray menu item is clicked. */
const TRAY_ACTION_EVENT = "tray-action";

/** Subscribes to a Tauri event for the lifetime of the returned cleanup. */
const subscribe = <T>(name: string, handler: EventCallback<T>): (() => void) => {
  let unlisten: (() => void) | undefined;
  let disposed = false;

  void listen<T>(name, handler)
    .then((fn) => {
      if (disposed) fn();
      else unlisten = fn;
    })
    .catch((error) => console.warn(`Could not listen for ${name}:`, error));

  return () => {
    disposed = true;
    unlisten?.();
  };
};

/**
 * Runs the timer's side effects: ticking, notifications, tray updates, tray
 * menu actions, and the initial settings load. Mount this exactly once, at the
 * app root, so the timer keeps running no matter which page is open.
 */
export const useTimerEngine = () => {
  const phase = useTimerStore((s) => s.state.phase);
  const remainingSeconds = useTimerStore((s) => s.state.remainingSeconds);
  const completedSessions = useTimerStore((s) => s.state.completedSessions);
  const settings = useTimerStore((s) => s.settings);
  const transition = useTimerStore((s) => s.transition);
  const setSettings = useTimerStore((s) => s.setSettings);
  const setLoadingSettings = useTimerStore((s) => s.setLoadingSettings);
  const setSettingsError = useTimerStore((s) => s.setSettingsError);

  const notificationService = useMemo(() => new TauriNotificationService(), []);
  const trayService = useMemo(() => new TauriTrayService(), []);
  const settingsStore = useMemo(() => new TauriSettingsStore(), []);
  const previousCompletedRef = useRef(completedSessions);
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

  // Notify when a session ends on its own and the next one begins. Several
  // sessions can end in one tick after a long sleep; one notification covers
  // whichever session is current now.
  useEffect(() => {
    const previous = previousCompletedRef.current;
    previousCompletedRef.current = completedSessions;
    if (completedSessions <= previous) return;

    const current = settingsRef.current;
    if (phase === "break") {
      void notificationService.notify({
        title: "Time for a break",
        body: `Nice work. Take ${describeDuration(current.breakMinutes, current.breakUnit)} to rest.`,
      });
    } else if (phase === "work") {
      void notificationService.notify({
        title: "Break's over",
        body: `Time to get back to it for ${describeDuration(current.workMinutes, current.workUnit)}.`,
      });
    }
  }, [notificationService, completedSessions, phase]);

  useEffect(() => {
    void trayService.setSnapshot({ status: phase, remainingSeconds });
  }, [phase, remainingSeconds, trayService]);

  // Ticks come from a native thread so they keep arriving while the window is
  // hidden, where webviews throttle JavaScript timers. Each carries the clock
  // reading it was taken at, so bunched-up deliveries still resolve correctly.
  useEffect(
    () =>
      subscribe<number>(TICK_EVENT, (event) =>
        transition({ type: "TICK" }, event.payload),
      ),
    [transition],
  );

  useEffect(
    () =>
      subscribe<TrayAction>(TRAY_ACTION_EVENT, (event) => {
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
      }),
    [transition],
  );
};
