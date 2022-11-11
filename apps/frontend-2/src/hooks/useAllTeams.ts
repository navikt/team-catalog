import { useQuery } from "react-query";

import type { TeamsSearchParameters } from "../api";
import { getAllTeams } from "../api";

export function useAllTeams(searchParameters: TeamsSearchParameters) {
  return useQuery({
    queryKey: ["getAllTeams", searchParameters],
    queryFn: () => getAllTeams(searchParameters),
    select: (data) => data.content,
  });
}
