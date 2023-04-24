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

export async function saveNotification(notification: Notification) {
  return axios.post<Notification>(`${env.teamCatalogBaseUrl}/notification`, notification);
}

export async function getNotifications() {
  return axios.get<PageResponse<Notification>>(`${env.teamCatalogBaseUrl}/notification`);
}

export async function deleteNotification(id: string) {
  return axios.delete<Notification>(`${env.teamCatalogBaseUrl}/notification/${id}`);
}
