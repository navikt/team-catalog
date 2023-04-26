import axios from "axios";

import type { PageResponse, Process } from "../constants";
import { env } from "../util/env";

export const getProcessesForTeam = async (teamId: string) => {
  try {
    const { data } = await axios.get<PageResponse<Process>>(
      `${env.teamCatalogBaseUrl}/integration/pcat/process?teamId=${teamId}`
    );
    return data.content;
  } catch {
    return [];
  }
};
