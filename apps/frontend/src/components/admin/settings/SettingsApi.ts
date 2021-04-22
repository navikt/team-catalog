import axios from "axios"
import {env} from '../../../util/env'

export const getSettings = async () => {
  return (await axios.get<Settings>(`${env.teamCatalogBaseUrl}/settings`)).data
}

export const writeSettings = async (settings: Settings) => {
  return (await axios.post<Settings>(`${env.teamCatalogBaseUrl}/settings`, settings)).data
}

export interface Settings {
  frontpageMessage: string
  identFilter: string[]
}
