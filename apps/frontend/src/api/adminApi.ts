import axios from "axios";
import dayjs from "dayjs";

import type { AuditItem, AuditLog, MailLog, ObjectType, PageResponse, Settings } from "../constants";
import { env } from "../util/env";

export const getMailLog = async (start: number, count: number, filterOutUpdates: boolean) => {
  return (
    await axios.get<PageResponse<MailLog>>(
      `${env.teamCatalogBaseUrl}/audit/maillog?pageNumber=${start}&pageSize=${count}&filterOutUpdates=${filterOutUpdates}`,
    )
  ).data;
};

export const getSettings = async () => {
  return (await axios.get<Settings>(`${env.teamCatalogBaseUrl}/settings`)).data;
};

export const writeSettings = async (settings: Settings) => {
  return (await axios.post<Settings>(`${env.teamCatalogBaseUrl}/settings`, settings)).data;
};

export const auditLogKeys = {
  all: ["AUDIT_LOGS"] as const,
  id: (id: string) => [...auditLogKeys.all, id] as const,
};

export const auditKeys = {
  all: ["AUDIT"] as const,
  page: (pageInfo: { page: number; count: number; table?: ObjectType }) => [...auditKeys.all, pageInfo] as const,
};

export const getAuditLog = async (id: string) => {
  const auditLog = (await axios.get<AuditLog>(`${env.teamCatalogBaseUrl}/audit/log/${id}`)).data;
  auditLog.audits.sort((a, b) => dayjs(b.time).valueOf() - dayjs(a.time).valueOf());
  return auditLog;
};

export const getAudits = async ({ page, count, table }: { page: number; count: number; table?: ObjectType }) => {
  return (
    await axios.get<PageResponse<AuditItem>>(
      `${env.teamCatalogBaseUrl}/audit?pageNumber=${page}&pageSize=${count}` + (table ? `&table=${table}` : ""),
    )
  ).data;
};
