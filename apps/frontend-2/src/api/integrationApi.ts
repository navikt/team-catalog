import axios from "axios";

import type { PageResponse, Process } from "../constants";
import { env } from "../util/env";

export const getProcessesForTeam = async (teamId: string) => {
  try {
    const { data } = await axios.get<PageResponse<Process>>(
      `${env.teamCatalogBaseUrl}/integration/pcat/process?teamId=${teamId}`
    );
    return data.content;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getProcessesForProductArea = async (productareaId: string) => {
  try {
    const { data } = await axios.get<PageResponse<Process>>(
      `${env.teamCatalogBaseUrl}/integration/pcat/process?productAreaId=${productareaId}`
    );
    return data.content;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getProcessesForCluster = async (clusterId: string) => {
  try {
    const { data } = await axios.get<PageResponse<Process>>(
      `${env.teamCatalogBaseUrl}/integration/pcat/process?clusterId=${clusterId}`
    );
    return data.content;
  } catch (error) {
    console.log(error);
    return [];
  }
};
