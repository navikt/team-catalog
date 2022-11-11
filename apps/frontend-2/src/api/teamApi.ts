import axios from "axios";

import type { NaisTeam, PageResponse, ProductTeam, ProductTeamFormValues } from "../constants";
import type { Status } from "../constants";
import { ampli } from "../services/Amplitude";
import { env } from "../util/env";

export const deleteTeam = async (teamId: string) => {
  await axios.delete(`${env.teamCatalogBaseUrl}/team/${teamId}`);
};

export const searchTeams = async (searchTerm: string) => {
  const data = (await axios.get<PageResponse<ProductTeam>>(`${env.teamCatalogBaseUrl}/team/search/${searchTerm}`)).data;
  return data;
};

export type TeamsSearchParameters = {
  productAreaId?: string;
  clusterId?: string;
  locationCode?: string;
  status?: Status;
};
export const getAllTeams = async (searchParameters: TeamsSearchParameters) => {
  const { data } = await axios.get<PageResponse<ProductTeam>>(`${env.teamCatalogBaseUrl}/team`, {
    params: searchParameters,
  });
  return data;
};

export const getTeam = async (teamId: string) => {
  const { data } = await axios.get<ProductTeam>(`${env.teamCatalogBaseUrl}/team/${teamId}`);
  const unknownMembers = data.members.filter((m) => !m.resource.fullName);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const sortedMembers = data.members
    .filter((m) => m.resource.fullName)
    .sort((a, b) => a.resource.fullName!.localeCompare(b.resource.fullName!));
  data.members = [...sortedMembers, ...unknownMembers];
  return data;
};

export const createTeam = async (team: ProductTeamFormValues) => {
  try {
    ampli.logEvent("teamkatalog_create_team");
    return (await axios.post<ProductTeam>(`${env.teamCatalogBaseUrl}/team/v2`, team)).data;
  } catch (error: any) {
    console.log(error.response, "ERROR.RESPONSE");
    if (error.response.data.message.includes("alreadyExist")) {
      return "Teamet eksisterer allerede. Endre i eksisterende team ved behov.";
    }
    return error.response.data.message;
  }
};

export const editTeam = async (team: ProductTeamFormValues) => {
  try {
    ampli.logEvent("teamkatalog_edit_team");
    return (await axios.put<ProductTeam>(`${env.teamCatalogBaseUrl}/team/v2/${team.id}`, team)).data;
  } catch (error: any) {
    if (error.response.data.message.includes("alreadyExist")) {
      return "Teamet eksisterer allerede. Endre i eksisterende team ved behov.";
    } else if (error.response.data.message.includes("officeHours -- doesNotExist")) {
      return "Du må angi lokasjon når du angir planlagte kontordager";
    }
    return error.response.data.message;
  }
};

export const searchNaisTeam = async (teamSearch: string) => {
  return (await axios.get<PageResponse<NaisTeam>>(`${env.teamCatalogBaseUrl}/naisteam/search/${teamSearch}`)).data;
};
