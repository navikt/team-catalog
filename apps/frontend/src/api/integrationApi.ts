import axios from 'axios'
import { PageResponse, Process } from '../constants'
import { env } from '../util/env'

export const getProcessesForTeam = async (teamId: string) => {
  try {
    const data = (await axios.get<PageResponse<Process>>(`${env.teamCatalogBaseUrl}/integration/process?teamId=${teamId}`)).data;
    return data.content;
  } catch (e) {
    console.log(e)
    return []
  }
};

export const getProcessesForProductArea = async (productareaId: string) => {
  try {
    const data = (await axios.get<PageResponse<Process>>(`${env.teamCatalogBaseUrl}/integration/process?productAreaId=${productareaId}`)).data;
    return data.content;
  } catch (e) {
    console.log(e)
    return []
  }
};
