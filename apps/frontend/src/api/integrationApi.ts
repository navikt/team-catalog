import axios from 'axios'
import {PageResponse, Process} from '../constants'
import {env} from '../util/env'

export const getProcessesForTeam = async (teamId: string) => {
  try {
    const data = (await axios.get<PageResponse<Process>>(`${env.teamCatalogBaseUrl}/integration/pcat/process?teamId=${teamId}`)).data
    return data.content
  } catch (e: any) {
    console.log(e)
    return []
  }
}

export const getProcessesForProductArea = async (productareaId: string) => {
  try {
    const data = (await axios.get<PageResponse<Process>>(`${env.teamCatalogBaseUrl}/integration/pcat/process?productAreaId=${productareaId}`)).data
    return data.content
  } catch (e: any) {
    console.log(e)
    return []
  }
}

export const getProcessesForCluster = async (clusterId: string) => {
  try {
    const data = (await axios.get<PageResponse<Process>>(`${env.teamCatalogBaseUrl}/integration/pcat/process?clusterId=${clusterId}`)).data
    return data.content
  } catch (e: any) {
    console.log(e)
    return []
  }
}
