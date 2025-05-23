import axios from "axios";

import type { OrgEnhetDto } from "../types/teamcat-models";
import { env } from "../util/env";

export const getOrgEnhet = async (orgEnhetId: string) => {
  return (await axios.get<OrgEnhetDto>(`${env.teamCatalogBaseUrl}/org/${orgEnhetId}`)).data;
};

export const getOrgEnheter = async (orgEnhetIds: string[]) => {
  return (await axios.post<OrgEnhetDto[]>(`${env.teamCatalogBaseUrl}/org`, orgEnhetIds)).data;
};
