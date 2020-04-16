import * as React from "react";
import axios from "axios";
import {PageResponse, ProductTeam, ProductTeamFormValues} from "../constants";
import {env} from "../util/env";
import {useDebouncedState} from "../util/hooks";
import {Option} from "baseui/select";

export const getAllTeams = async () => {
  const data = (await axios.get<PageResponse<ProductTeam>>(`${env.teamCatalogBaseUrl}/team`)).data;
  return data;
};

export const getAllTeamsForProductArea = async (productAreaId: string) => {
  const data = (await axios.get<PageResponse<ProductTeam>>(`${env.teamCatalogBaseUrl}/team?productAreaId=${productAreaId}`)).data;
  return data;
};

export const getTeam = async (teamId: string) => {
  const data = (await axios.get<ProductTeam>(`${env.teamCatalogBaseUrl}/team/${teamId}`)).data;
  data.members = data.members.sort((a, b) => a.name.localeCompare(b.name));
  return data;
};

export const createTeam = async (team: ProductTeamFormValues) => {
  try {
    return (await axios.post<ProductTeam>(`${env.teamCatalogBaseUrl}/team`, team)).data;
  } catch (error) {
    return error
  }
};

export const editTeam = async (team: ProductTeamFormValues) => {
  try {
    return (await axios.put<ProductTeam>(`${env.teamCatalogBaseUrl}/team/${team.id}`, team)).data;
  } catch (error) {
    return error
  }
};

export const searchNaisTeam = async (teamSearch: string) => {
  return (await axios.get<PageResponse<ProductTeam>>(`${env.teamCatalogBaseUrl}/naisteam/search/${teamSearch}`)).data;
};

export const mapTeamToOption = (team: ProductTeam) => ({ id: team.id, label: team.name });

export const mapProductTeamToFormValue = (team:ProductTeam):ProductTeamFormValues=>{
  return {
    id: team.id,
    productAreaId: team.productAreaId || '',
    description: team.description || '',
    members: team.members || [],
    naisTeams: team.naisTeams || [],
    name: team.name || '',
    slackChannel: team.slackChannel || '',
    teamLeadQA: team.teamLeadQA || false,
    teamLeader:team.teamLeader || '',
    teamType: team.teamType
  }
}

export const mapFormValueToProductTeam = (formValues:ProductTeamFormValues):ProductTeam=>{
  return {
    id: formValues.id!,
    productAreaId: formValues.productAreaId || '',
    description: formValues.description || '',
    members: formValues.members || [],
    naisTeams: formValues.naisTeams || [],
    name: formValues.name || '',
    slackChannel: formValues.slackChannel || '',
    teamLeadQA: formValues.teamLeadQA || false,
    teamLeader: formValues.teamLeader || '',
    teamType: formValues.teamType
  }
}

export const useTeamSearch = () => {
  const [teamSearch, setTeamSearch] = useDebouncedState<string>("", 200);
  const [searchResult, setInfoTypeSearchResult] = React.useState<Option[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    const search = async () => {
      if (teamSearch && teamSearch.length > 2) {
        setLoading(true);
        const res = await searchNaisTeam(teamSearch);
        let options: Option[] = res.content.map(mapTeamToOption);
        setInfoTypeSearchResult(options);
        setLoading(false);
      }
    };
    search();
  }, [teamSearch]);

  return [searchResult, setTeamSearch, loading] as [Option[], React.Dispatch<React.SetStateAction<string>>, boolean];
};
