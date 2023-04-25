import axios from "axios";
import partition from "lodash/partition";
import sortBy from "lodash/sortBy";
import { useEffect, useState } from "react";

import type {
  NaisTeam,
  OptionType,
  PageResponse,
  ProductTeam,
  ProductTeamFormValues,
  ProductTeamSubmitValues,
} from "../constants";
import { AddressType, Status, TeamOwnershipType, TeamType } from "../constants";
import { ampli } from "../services/Amplitude";
import { env } from "../util/env";

export const deleteTeam = async (teamId: string) => {
  await axios.delete(`${env.teamCatalogBaseUrl}/team/${teamId}`);
};

export const searchTeams = async (searchTerm: string) => {
  return (await axios.get<PageResponse<ProductTeam>>(`${env.teamCatalogBaseUrl}/team/search/${searchTerm}`)).data;
};

export type TeamsSearchParameters = {
  productAreaId?: string;
  clusterId?: string;
  locationCode?: string;
  status?: Status;
};

export async function getAllTeams(searchParameters: TeamsSearchParameters) {
  const response = await axios.get<PageResponse<ProductTeam>>(`${env.teamCatalogBaseUrl}/team`, {
    params: searchParameters,
  });

  return response.data;
}

export const getTeam = async (teamId: string) => {
  const { data } = await axios.get<ProductTeam>(`${env.teamCatalogBaseUrl}/team/${teamId}`);

  const [membersWithName, membersWithoutName] = partition(data.members, (m) => m.resource.fullName);
  const sortedMembers = sortBy(membersWithName, (m) => m.resource.fullName);
  data.members = [...sortedMembers, ...membersWithoutName];

  return data;
};

export const createTeam = async (team: ProductTeamSubmitValues) => {
  try {
    ampli.logEvent("teamkatalog_create_team");
    return (await axios.post<ProductTeam>(`${env.teamCatalogBaseUrl}/team/v2`, team)).data;
  } catch (error: any) {
    if (error.response.data.message.includes("alreadyExist")) {
      return "Teamet eksisterer allerede. Endre i eksisterende team ved behov.";
    }
    return error.response.data.message;
  }
};

export const editTeam = async (team: ProductTeamSubmitValues) => {
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

export const getNaisTeams = async (): Promise<PageResponse<NaisTeam>> => {
  return (await axios.get<PageResponse<NaisTeam>>(`${env.teamCatalogBaseUrl}/naisteam`)).data;
};

export const mapProductTeamToFormValue = (team?: ProductTeam): ProductTeamFormValues => {
  const contactSlackChannels: OptionType[] = team
    ? team.contactAddresses
        .filter((address) => address.type === AddressType.SLACK)
        .map((a) => ({ value: a.address, label: a.address }))
    : [];
  const contactSlackUsers: OptionType[] = team
    ? team.contactAddresses
        .filter((address) => address.type === AddressType.SLACK_USER)
        .map((a) => ({ value: a.address, label: a.address }))
    : [];
  const contactEmail = team
    ? team.contactAddresses.find((addresses) => addresses.type === AddressType.EPOST)?.address
    : "";

  return {
    id: team?.id,
    productAreaId: team?.productAreaId || "",
    clusterIds: team ? team.clusterIds.map((c) => ({ value: c, label: c })) : [],
    description: team?.description || "",
    members:
      team?.members.map((m) => ({
        navIdent: m.navIdent,
        roles: m.roles,
        description: m.description || "",
        fullName: m.resource.fullName || undefined,
        resourceType: m.resource.resourceType || undefined,
      })) || [],
    naisTeams: team?.naisTeams || [],
    name: team?.name || "",
    slackChannel: team?.slackChannel || "",
    contactPersonIdent:
      team && team.contactPersonIdent ? { value: team.contactPersonIdent, label: team.contactPersonIdent } : undefined,
    qaTime: team?.qaTime || undefined,
    teamOwnershipType: team?.teamOwnershipType || TeamOwnershipType.UNKNOWN,
    tags: team ? team.tags.map((t) => ({ value: t, label: t })) : [],
    locations: team?.locations || [],
    contactAddresses: team?.contactAddresses || [],
    contactAddressesChannels: contactSlackChannels,
    contactAddressesUsers: contactSlackUsers,
    contactAddressEmail: contactEmail,
    status: team?.status || Status.ACTIVE,
    teamOwnerIdent:
      team && team.teamOwnerIdent ? { value: team.teamOwnerIdent, label: team.teamOwnerIdent } : undefined,
    teamType: team?.teamType || TeamType.UNKNOWN,
    officeHours: team?.officeHours
      ? {
          locationFloor: { value: team.officeHours.location.code, label: team.officeHours.location.description },
          days: team.officeHours.days || [],
          information: team.officeHours.information || "",
          parent: team.officeHours.location.parent,
        }
      : undefined,
  };
};

export const useAllTeams = () => {
  const [teams, setTeams] = useState<ProductTeam[]>([]);
  useEffect(() => {
    getAllTeams({ status: Status.ACTIVE }).then((r) => setTeams(r.content));
  }, []);
  return teams;
};

export const forceSync = (resetStatus: boolean) =>
  axios.post<void>(`${env.teamCatalogBaseUrl}/team/sync?resetStatus=${resetStatus}`);
