export interface NotificationPayload {
  title: string;
  body: string;
}

export interface NotificationService {
  requestPermission(): Promise<void>;
  notify(payload: NotificationPayload): Promise<void>;
}

export class BrowserNotificationService implements NotificationService {
  async requestPermission(): Promise<void> {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }

  async notify(payload: NotificationPayload): Promise<void> {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    new Notification(payload.title, { body: payload.body });
  }
}
