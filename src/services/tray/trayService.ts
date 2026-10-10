import { invoke } from "@tauri-apps/api/core";

export type TrayStatus = "idle" | "work" | "break" | "paused";
export type TrayAction = "start" | "pause" | "resume" | "reset";

export interface TraySnapshot {
  status: TrayStatus;
  remainingSeconds: number;
}

export interface TrayService {
  init(): Promise<void>;
  setSnapshot(snapshot: TraySnapshot): Promise<void>;
}

export class TauriTrayService implements TrayService {
  async init(): Promise<void> {
    await this.setSnapshot({ status: "idle", remainingSeconds: 0 });
  }

  async setSnapshot(snapshot: TraySnapshot): Promise<void> {
    try {
      await invoke("update_tray_snapshot", { snapshot });
    } catch (error) {
      // The tray is a convenience; never let it interrupt the timer.
      console.warn("Could not update the tray:", error);
    }
  }
}
