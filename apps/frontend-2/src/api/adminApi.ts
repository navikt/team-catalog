import axios from "axios";

import type { MailLog, PageResponse, Settings } from "../constants";
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
  return (await axios.get<Settings>(`${env.teamCatalogBaseUrl}/settings`)).data;
};

export const writeSettings = async (settings: Settings) => {
  return (await axios.post<Settings>(`${env.teamCatalogBaseUrl}/settings`, settings)).data;
};
