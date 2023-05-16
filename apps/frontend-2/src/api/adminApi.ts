import axios from "axios";
import dayjs from "dayjs";
import type { AuditAction, AuditItem, AuditLog, MailLog, ObjectType, PageResponse, Settings } from "../constants";
import { env } from "../util/env";

export const getMailLog = async (start: number, count: number, filterOutUpdates: boolean) => {
  const data = (
    await axios.get<PageResponse<MailLog>>(
      `${env.teamCatalogBaseUrl}/audit/maillog?pageNumber=${start}&pageSize=${count}&filterOutUpdates=${filterOutUpdates}`
    )
  ).data;
  return data;
};

export const getSettings = async () => {
  return (await axios.get<Settings>(`${env.teamCatalogBaseUrl}/settings`)).data
}

export const writeSettings = async (settings: Settings) => {
  return (await axios.post<Settings>(`${env.teamCatalogBaseUrl}/settings`, settings)).data
}

export const getAuditLog = async (id: string) => {
  const auditLog = (await axios.get<AuditLog>(`${env.teamCatalogBaseUrl}/audit/log/${id}`)).data
  auditLog.audits.sort((a, b) => dayjs(b.time).valueOf() - dayjs(a.time).valueOf())
  return auditLog
}

export const getAudits = async (page: number, count: number, table?: ObjectType) => {
  return (await axios.get<PageResponse<AuditItem>>(`${env.teamCatalogBaseUrl}/audit/?pageNumber=${page}&pageSize=${count}` + (table ? `&table=${table}` : ''))).data
}

export const getEvents = async (page: number, count: number, table: ObjectType, tableId?: string, action?: AuditAction) => {
  return (await axios.get<PageResponse<Event>>(`${env.teamCatalogBaseUrl}/event/?pageNumber=${page}&pageSize=${count}&table=${table}`
      + (tableId ? `&tableId=${tableId}` : '')
      + (action ? `&action=${action}` : ''))
  ).data
}


