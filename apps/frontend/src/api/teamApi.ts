import axios from "axios";
import {NaisTeam, PageResponse, ProductTeam, ProductTeamFormValues, TeamType} from "../constants";
import {env} from "../util/env";
import {useSearch} from "../util/hooks";
import {ampli} from '../services/Amplitude'
import {useEffect, useState} from 'react'
import {mapToOptions} from './index'

export const deleteTeam = async (teamId: string) => {
  await axios.delete(`${env.teamCatalogBaseUrl}/team/${teamId}`)
}

export const getAllTeams = async () => {
  const data = (await axios.get<PageResponse<ProductTeam>>(`${env.teamCatalogBaseUrl}/team`)).data;
  return data;
}

export const getAllTeamsForProductArea = async (productAreaId: string) => {
  const data = (await axios.get<PageResponse<ProductTeam>>(`${env.teamCatalogBaseUrl}/team?productAreaId=${productAreaId}`)).data;
  return data;
}

export const getAllTeamsForCluster = async (clusterId: string) => {
  const data = (await axios.get<PageResponse<ProductTeam>>(`${env.teamCatalogBaseUrl}/team?clusterId=${clusterId}`)).data;
  return data;
}

export const getTeam = async (teamId: string) => {
  const data = (await axios.get<ProductTeam>(`${env.teamCatalogBaseUrl}/team/${teamId}`)).data;
  const unknownMembers = data.members.filter((m) => !m.resource.fullName);
  const sortedMembers = data.members.filter((m) => m.resource.fullName).sort((a, b) => a.resource.fullName!.localeCompare(b.resource.fullName!));
  data.members = [...sortedMembers, ...unknownMembers]
  return data;
}

export const createTeam = async (team: ProductTeamFormValues) => {
  try {
    ampli.logEvent("teamkatalog_create_team");
    return (await axios.post<ProductTeam>(`${env.teamCatalogBaseUrl}/team`, team)).data;
  } catch (error) {
    if (error.response.data.message.includes("alreadyExist")) {
      return "Teamet eksisterer allerede. Endre i eksisterende team ved behov.";
    }
    return error.response.data.message;
  }
}

export const editTeam = async (team: ProductTeamFormValues) => {
  try {
    ampli.logEvent("teamkatalog_edit_team");
    return (await axios.put<ProductTeam>(`${env.teamCatalogBaseUrl}/team/${team.id}`, team)).data;
  } catch (error) {
    if (error.response.data.message.includes("alreadyExist")) {
      return "Teamet eksisterer allerede. Endre i eksisterende team ved behov.";
    }
    return error.response.data.message;
  }
}

export const searchNaisTeam = async (teamSearch: string) => {
  return (await axios.get<PageResponse<NaisTeam>>(`${env.teamCatalogBaseUrl}/naisteam/search/${teamSearch}`)).data;
}

export const mapProductTeamToFormValue = (team?: ProductTeam): ProductTeamFormValues => {
  return {
    id: team?.id,
    productAreaId: team?.productAreaId || "",
    clusterIds: team?.clusterIds || [],
    description: team?.description || "",
    members: team?.members.map((m) => ({
      navIdent: m.navIdent,
      roles: m.roles,
      description: m.description || "",
      fullName: m.resource.fullName || undefined,
      resourceType: m.resource.resourceType || undefined
    })) || [],
    naisTeams: team?.naisTeams || [],
    name: team?.name || "",
    slackChannel: team?.slackChannel || "",
    qaTime: team?.qaTime || undefined,
    teamType: team?.teamType || TeamType.UNKNOWN,
    tags: team?.tags || [],
    locations: team?.locations || []
  }
}

export const useNaisTeamSearch = () => useSearch(async s => mapToOptions((await searchNaisTeam(s)).content))

export const useAllTeams = () => {
  const [teams, setTeams] = useState<ProductTeam[]>([])
  useEffect(() => {
    getAllTeams().then(r => setTeams(r.content))
  }, [])
  return teams
}
