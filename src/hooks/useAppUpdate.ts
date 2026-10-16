import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  TauriUpdateService,
  type AvailableUpdate,
  type DownloadProgress,
} from "../services/updates/updateService";

/** Give the window a moment to settle before going to the network. */
const CHECK_DELAY_MS = 2_000;

export type UpdateStatus =
  | { kind: "idle" }
  | { kind: "available"; update: AvailableUpdate }
  | { kind: "installing"; update: AvailableUpdate; progress: DownloadProgress }
  | { kind: "restart-needed"; update: AvailableUpdate }
  | { kind: "failed"; update: AvailableUpdate; message: string };

const describeError = (error: unknown): string => {
  const text = error instanceof Error ? error.message : String(error);
  return text || "Something went wrong while installing the update.";
};

/**
 * Checks GitHub Releases once per launch and walks the user through installing
 * a newer version. Mount it once, at the app root.
 */
export const useAppUpdate = () => {
  const service = useMemo(() => new TauriUpdateService(), []);
  const [status, setStatus] = useState<UpdateStatus>({ kind: "idle" });
  const checkedRef = useRef(false);

  useEffect(() => {
    // StrictMode mounts twice in development; only ever check once.
    if (checkedRef.current) return;
    checkedRef.current = true;

    const timeoutId = window.setTimeout(() => {
      void service
        .check()
        .then((update) => {
          if (update) setStatus({ kind: "available", update });
        })
        .catch((error) => {
          // Offline, or a packaging format that cannot self-update. Not the
          // user's problem; the app works fine without the check.
          console.info("Skipped the update check:", error);
        });
    }, CHECK_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [service]);

  const install = useCallback(async () => {
    if (status.kind !== "available" && status.kind !== "failed") return;
    const { update } = status;

    setStatus({
      kind: "installing",
      update,
      progress: { downloadedBytes: 0, totalBytes: null },
    });

    try {
      await service.install((progress) =>
        setStatus({ kind: "installing", update, progress }),
      );
    } catch (error) {
      setStatus({ kind: "failed", update, message: describeError(error) });
      return;
    }

    try {
      await service.relaunch();
    } catch {
      setStatus({ kind: "restart-needed", update });
    }
  }, [service, status]);

  const dismiss = useCallback(() => setStatus({ kind: "idle" }), []);

  return { status, install, dismiss };
};
