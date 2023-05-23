import type { AxiosError } from "axios";
import { useQuery } from "react-query";

import type { TeamsSearchParameters } from "../api/teamApi";
import { getAllTeams } from "../api/teamApi";
import type { PageResponse, ProductTeamResponse } from "../constants";

export function useAllTeams(searchParameters: TeamsSearchParameters) {
  return useQuery<PageResponse<ProductTeamResponse>, AxiosError<unknown>, ProductTeamResponse[]>({
    queryKey: ["getAllTeams", searchParameters],
    queryFn: () => getAllTeams(searchParameters),
    select: (data) => data.content,
  });
}
