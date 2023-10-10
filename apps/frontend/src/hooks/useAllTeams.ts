import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import type { TeamsSearchParameters } from "../api/teamApi";
import { getAllTeamQuery } from "../api/teamApi";
import type { PageResponse, ProductTeamResponse } from "../constants";

export function useAllTeams(searchParameters: TeamsSearchParameters) {
  return useQuery<PageResponse<ProductTeamResponse>, AxiosError<unknown>, ProductTeamResponse[]>({
    queryKey: getAllTeamQuery.queryKey(searchParameters),
    queryFn: () => getAllTeamQuery.queryFn(searchParameters),
    select: (data) => data.content,
    enabled: Object.values(searchParameters).every(Boolean),
  });
}
