import axios from "axios";

import type { OrgEnhetDto } from "../types/teamcat-models";
import { env } from "../util/env";

export const getOrgEnheter = async (orgEnhetIds: string[]) => {
  return (await axios.post<OrgEnhetDto[]>(`${env.teamCatalogBaseUrl}/org`, orgEnhetIds)).data;
};
