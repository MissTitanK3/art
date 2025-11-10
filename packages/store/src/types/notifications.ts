export const NOTIFICATION_CHANNELS = [
  "system",
  "dispatch",
  "academy",
  "watch",
  "advocacy",
] as const;

export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];
