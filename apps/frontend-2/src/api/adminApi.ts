import axios from 'axios'
import { MailLog, NaisTeam, PageResponse, ProductTeam, ProductTeamFormValues, Status, TeamOwnershipType, TeamType } from '../constants'
import { env } from '../util/env'


export const getMailLog = async (start: number, count: number, filterOutUpdates: boolean) => {

  const data = (await axios.get<PageResponse<MailLog>>(`${env.teamCatalogBaseUrl}/audit/maillog?pageNumber=${start}&pageSize=${count}&filterOutUpdates=${filterOutUpdates}`)).data
  return data
}


