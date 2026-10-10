import { invoke } from "@tauri-apps/api/core";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { platform } from "@tauri-apps/plugin-os";

export interface NotificationPayload {
  title: string;
  body: string;
}

export interface NotificationService {
  notify(payload: NotificationPayload): Promise<void>;
}

export class TauriNotificationService implements NotificationService {
  async notify(payload: NotificationPayload): Promise<void> {
    try {
      // Check platform and use appropriate notification method
      const currentPlatform = await platform();

      if (currentPlatform === "linux") {
        // Use Rust notify function for Linux
        await invoke("notify", {
          title: payload.title,
          body: payload.body,
        });
      } else {
        // Use Tauri notification plugin for other platforms
        let permissionGranted = await isPermissionGranted();

        if (!permissionGranted) {
          const permission = await requestPermission();
          permissionGranted = permission === "granted";
        }

        if (permissionGranted) {
          await sendNotification({
            title: payload.title,
            body: payload.body,
          });
        }
      }
    } catch (e) {
      console.error("Notification failed:", e);
    }
  }
}
