// "When accessing a member from an await expression, the await expression has to be parenthesized, which is not readable."
// For the purpose of this file it is convenient to be able to access the data property of axios response as a one-liners.

import axios from "axios";

import type { NaisTeam } from "../constants";
import { env } from "../util/env";

export const CACHE_FOR = {
  aDay: 1000 * 60 * 60 * 24,
  anHour: 1000 * 60 * 60,
};

export const naisTeamsKeys = {
  all: ["NAIS_TEAMS"] as const,
};

export const getNaisTeams = {
  queryKey: naisTeamsKeys.all,
  queryFn: async () => (await axios.get<PageWrapper>(`${env.teamCatalogBaseUrl}/naisteam`)).data.content,
  staleTime: CACHE_FOR.anHour,
  cacheTime: CACHE_FOR.aDay,
};

type PageWrapper = {
  pageNumber: number;
  pageSize: number;
  pages: number;
  numberOfElements: number;
  totalElements: number;
  paged: boolean;
  content: NaisTeam[];
};
