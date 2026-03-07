export type TrayStatus = "idle" | "work" | "break" | "paused";

export interface TraySnapshot {
  status: TrayStatus;
  remainingSeconds: number;
}

export interface TrayService {
  init(): Promise<void>;
  setSnapshot(snapshot: TraySnapshot): Promise<void>;
}

export class NoopTrayService implements TrayService {
  async init(): Promise<void> {
    // Implemented in Phase 4 when native tray actions are wired.
  }

  async setSnapshot(snapshot: TraySnapshot): Promise<void> {
    void snapshot;
    // Implemented in Phase 4 when native tray state sync is wired.
  }
}
