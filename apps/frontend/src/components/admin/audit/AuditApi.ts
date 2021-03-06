import axios from "axios"
import moment from "moment";
import { env } from '../../../util/env'
import { AuditAction, AuditItem, AuditLog, ObjectType } from './AuditTypes'
import { PageResponse } from '../../../constants'

export const getAuditLog = async (id: string) => {
  const auditLog = (await axios.get<AuditLog>(`${env.teamCatalogBaseUrl}/audit/log/${id}`)).data
  auditLog.audits.sort((a, b) => moment(b.time).valueOf() - moment(a.time).valueOf())
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
