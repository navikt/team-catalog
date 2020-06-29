import axios from 'axios'
import {InfoType, PageResponse, Process} from '../constants'
import {env} from '../util/env'

export const getProcessesForTeam = async (teamId: string) => {
  try {
    const data = (await axios.get<PageResponse<Process>>(`${env.teamCatalogBaseUrl}/integration/pcat/process?teamId=${teamId}`)).data;
    return data.content;
  } catch (e) {
    console.log(e)
    return []
  }
};

export const getProcessesForProductArea = async (productareaId: string) => {
  try {
    const data = (await axios.get<PageResponse<Process>>(`${env.teamCatalogBaseUrl}/integration/pcat/process?productAreaId=${productareaId}`)).data;
    return data.content;
  } catch (e) {
    console.log(e)
    return []
  }
};

export const getInfoTypesForTeam = async (teamId: string) => {
  try {
    const data = (await axios.get<PageResponse<InfoType>>(`${env.teamCatalogBaseUrl}/integration/pcat/informationtype?teamId=${teamId}`)).data;
    return data.content;
  } catch (e) {
    console.log(e)
    return []
  }
};

export const getInfoTypesForProductArea = async (productareaId: string) => {
  try {
    const data = (await axios.get<PageResponse<InfoType>>(`${env.teamCatalogBaseUrl}/integration/pcat/informationtype?productAreaId=${productareaId}`)).data;
    return data.content;
  } catch (e) {
    console.log(e)
    return []
  }
};
