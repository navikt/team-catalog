import * as React from "react";
import axios from "axios";
import { PageResponse, ProductTeam, ProductTeamFormValues } from "../constants";
import { env } from "../util/env";
import { useDebouncedState } from "../util/hooks";
import { Option } from "baseui/select";

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
  return (await axios.post<ProductTeam>(`${env.teamCatalogBaseUrl}/team`, team)).data;
};

export const searchNaisTeam = async (teamSearch: string) => {
  return (await axios.get<PageResponse<ProductTeam>>(`${env.teamCatalogBaseUrl}/naisteam/search/${teamSearch}`)).data;
};

export const mapTeamToOption = (team: ProductTeam) => ({ id: team.id, label: team.name });

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
