import axios from "axios";
import partition from "lodash/partition";
import sortBy from "lodash/sortBy";

import type {
  OptionType,
  PageResponse,
  ProductTeamFormValues,
  ProductTeamResponse,
  ProductTeamSubmitRequest,
} from "../constants";
import { AddressType, Status, TeamOwnershipType, TeamType } from "../constants";
import { env } from "../util/env";

export const teamKeys = {
  all: ["TEAMS"] as const,
  filter: (filter: TeamsSearchParameters) => [...teamKeys.all, filter] as const,
  id: (teamId: string) => [...teamKeys.all, teamId] as const,
};

export type TeamsSearchParameters = {
  productAreaId?: string;
  clusterId?: string;
  locationCode?: string;
  status?: Status;
};

export const searchTeams = async (searchTerm: string) => {
  return (await axios.get<PageResponse<ProductTeamResponse>>(`${env.teamCatalogBaseUrl}/team/search/${searchTerm}`))
    .data;
};

export async function getAllTeams(searchParameters: TeamsSearchParameters) {
  const response = await axios.get<PageResponse<ProductTeamResponse>>(`${env.teamCatalogBaseUrl}/team`, {
    params: searchParameters,
  });

  return response.data;
}

export const getAllTeamQuery = {
  queryKey: teamKeys.filter,
  queryFn: getAllTeams,
};

export const getTeam = async (teamId: string) => {
  const { data } = await axios.get<ProductTeamResponse>(`${env.teamCatalogBaseUrl}/team/${teamId}`);

  const [membersWithName, membersWithoutName] = partition(data.members, (m) => m.resource.fullName);
  const sortedMembers = sortBy(membersWithName, (m) => m.resource.fullName);
  data.members = [...sortedMembers, ...membersWithoutName];

  return data;
};

export const getTeamQuery = {
  queryKey: teamKeys.id,
  queryFn: getTeam,
};

export const createTeam = async (team: ProductTeamSubmitRequest) => {
  try {
    return (await axios.post<ProductTeamResponse>(`${env.teamCatalogBaseUrl}/team/v2`, team)).data;
  } catch (error: any) {
    if (error.response.data.message.includes("alreadyExist")) {
      return "Teamet eksisterer allerede. Endre i eksisterende team ved behov.";
    }
    return error.response.data.message;
  }
};

export const editTeam = async (team: ProductTeamSubmitRequest) => {
  return (await axios.put<ProductTeamResponse>(`${env.teamCatalogBaseUrl}/team/v2/${team.id}`, team)).data;
};

export const mapProductTeamToFormValue = (team?: ProductTeamResponse): ProductTeamFormValues => {
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
    naisTeams: team?.naisTeams.map((naisTeam) => ({ value: naisTeam, label: naisTeam })) || [],
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
