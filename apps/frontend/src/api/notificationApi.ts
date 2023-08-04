import axios from "axios";

import type { PageResponse } from "../constants";
import { env } from "../util/env";

export enum NotificationType {
  PA = "PA",
  TEAM = "TEAM",
  ALL_EVENTS = "ALL_EVENTS",
}

export enum NotificationChannel {
  EMAIL = "EMAIL",
  SLACK = "SLACK",
}

export enum NotificationTime {
  ALL = "ALL",
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
}

export type Notification = {
  id?: string;
  ident: string;
  target?: string;
  type: NotificationType;
  time: NotificationTime;
  channels: NotificationChannel[];
};

export const NOTIFICATION_CHANNEL_OPTIONS = {
  [NotificationChannel.SLACK]: "Slack",
  [NotificationChannel.EMAIL]: "E-post",
};

export const NOTIFICATION_TYPE_OPTIONS = {
  [NotificationType.PA]: "Produktområde",
  [NotificationType.TEAM]: "Team",
  [NotificationType.ALL_EVENTS]: "Alle hendelser",
};

export const FREQUENCY_OPTIONS = {
  [NotificationTime.ALL]: "Kontinuerlig",
  [NotificationTime.DAILY]: "Daglig",
  [NotificationTime.WEEKLY]: "Ukentlig",
  [NotificationTime.MONTHLY]: "Månedlig",
};

export async function saveNotification(notification: Notification) {
  return axios.post<Notification>(`${env.teamCatalogBaseUrl}/notification`, notification);
}

export async function getNotifications() {
  return axios.get<PageResponse<Notification>>(`${env.teamCatalogBaseUrl}/notification`);
}

export async function deleteNotification(id: string) {
  return axios.delete<Notification>(`${env.teamCatalogBaseUrl}/notification/${id}`);
}
