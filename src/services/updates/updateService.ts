import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export interface AvailableUpdate {
  version: string;
  currentVersion: string;
  /** Release notes, usually the GitHub release body as Markdown. */
  notes: string | null;
  publishedAt: string | null;
}

export interface DownloadProgress {
  downloadedBytes: number;
  /** Null until the server reports a size, or if it never does. */
  totalBytes: number | null;
}

export interface UpdateService {
  /**
   * Resolves null when the running version is current. Rejects when no check
   * could be made at all: offline, or an install that cannot self-update.
   */
  check(): Promise<AvailableUpdate | null>;
  /**
   * Downloads, verifies and installs the update found by the last `check`.
   * On Windows the app exits on its own partway through; elsewhere it resolves
   * once the new version is in place and `relaunch` should be called.
   */
  install(onProgress: (progress: DownloadProgress) => void): Promise<void>;
  relaunch(): Promise<void>;
}

export class TauriUpdateService implements UpdateService {
  private pending: Update | null = null;

  async check(): Promise<AvailableUpdate | null> {
    const update = await check();
    this.pending = update;
    if (!update) return null;
    return {
      version: update.version,
      currentVersion: update.currentVersion,
      notes: update.body?.trim() || null,
      publishedAt: update.date ?? null,
    };
  }

  async install(onProgress: (progress: DownloadProgress) => void): Promise<void> {
    const update = this.pending;
    if (!update) {
      throw new Error("No update to install. Check for one first.");
    }

    let downloadedBytes = 0;
    let totalBytes: number | null = null;
    await update.downloadAndInstall((event) => {
      switch (event.event) {
        case "Started":
          totalBytes = event.data.contentLength ?? null;
          break;
        case "Progress":
          downloadedBytes += event.data.chunkLength;
          break;
        case "Finished":
          if (totalBytes !== null) downloadedBytes = totalBytes;
          break;
      }
      onProgress({ downloadedBytes, totalBytes });
    });
    this.pending = null;
  }

  relaunch(): Promise<void> {
    return relaunch();
  }
}
