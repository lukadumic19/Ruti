import type { NotificationId } from "./ids";

export type NotificationSeverity = "info" | "warning" | "critical";

export interface Notification {
  id: NotificationId;
  /** ISO 8601. */
  at: string;
  severity: NotificationSeverity;
  title: string;
  body: string;
  read: boolean;
}
