import { Download, RefreshCw, X } from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { Button } from "./ui";
import { useAppUpdate, type UpdateStatus } from "../hooks/useAppUpdate";

const RELEASES_URL = "https://github.com/Saffron-codes/nomad/releases/latest";

const formatMegabytes = (bytes: number): string => `${(bytes / 1_000_000).toFixed(1)} MB`;

const describeProgress = (status: Extract<UpdateStatus, { kind: "installing" }>) => {
  const { downloadedBytes, totalBytes } = status.progress;
  if (totalBytes === null) {
    return downloadedBytes > 0
      ? `Downloading… ${formatMegabytes(downloadedBytes)}`
      : "Starting download…";
  }
  if (downloadedBytes >= totalBytes) return "Installing…";
  return `Downloading… ${formatMegabytes(downloadedBytes)} of ${formatMegabytes(totalBytes)}`;
};

const progressPercent = (status: Extract<UpdateStatus, { kind: "installing" }>) => {
  const { downloadedBytes, totalBytes } = status.progress;
  if (totalBytes === null || totalBytes === 0) return null;
  return Math.min(100, Math.round((downloadedBytes / totalBytes) * 100));
};

/** Asks once per launch whether to install a newer release, then does it. */
export function UpdatePrompt() {
  const { status, install, dismiss } = useAppUpdate();

  if (status.kind === "idle") return null;

  const { update } = status;
  const busy = status.kind === "installing";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-title"
    >
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-nomad-surface p-6 shadow-2xl">
        <p className="text-xs font-medium uppercase tracking-wide text-nomad-brand">
          Update available
        </p>
        <h2 id="update-title" className="mt-1 text-xl font-semibold text-nomad-text">
          Nomad {update.version} is ready to install
        </h2>
        <p className="mt-2 text-sm text-nomad-text-muted">
          You have {update.currentVersion}. Installing takes a minute and restarts Nomad.
          Your settings stay as they are.
        </p>

        {update.notes && status.kind === "available" && (
          <pre className="mt-4 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg border border-white/10 bg-black/20 p-3 font-sans text-sm text-nomad-text-muted">
            {update.notes}
          </pre>
        )}

        {status.kind === "installing" && (
          <div className="mt-4">
            <p className="text-sm text-nomad-text-muted" aria-live="polite">
              {describeProgress(status)}
            </p>
            <div
              className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPercent(status) ?? undefined}
            >
              <div
                className={`h-full rounded-full bg-nomad-brand transition-[width] ${progressPercent(status) === null ? "w-1/3 animate-pulse" : ""}`}
                style={
                  progressPercent(status) === null
                    ? undefined
                    : { width: `${progressPercent(status)}%` }
                }
              />
            </div>
          </div>
        )}

        {status.kind === "restart-needed" && (
          <p className="mt-4 text-sm text-nomad-text" role="status">
            The update is installed. Quit Nomad from the tray and open it again to start
            using {update.version}.
          </p>
        )}

        {status.kind === "failed" && (
          <div
            className="mt-4 rounded-lg border border-red-300/20 bg-red-500/10 p-3"
            role="alert"
          >
            <p className="text-sm text-red-300">
              The update could not be installed: {status.message}
            </p>
            <p className="mt-1 text-sm text-red-300/80">
              You can try again, or download it from the releases page instead.
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          {status.kind === "failed" && (
            <Button
              variant="ghost"
              onClick={() => void openUrl(RELEASES_URL).catch(() => undefined)}
            >
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              Open releases page
            </Button>
          )}
          {status.kind !== "restart-needed" && (
            <Button variant="ghost" onClick={dismiss} disabled={busy}>
              <X className="mr-2 h-4 w-4" aria-hidden="true" />
              {status.kind === "failed" ? "Close" : "Not now"}
            </Button>
          )}
          {(status.kind === "available" || status.kind === "failed") && (
            <Button variant="primary" onClick={() => void install()}>
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
              {status.kind === "failed" ? "Try again" : "Install and restart"}
            </Button>
          )}
          {status.kind === "restart-needed" && (
            <Button variant="primary" onClick={dismiss}>
              Got it
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
