import { useQuery } from "@tanstack/react-query";
import sortBy from "lodash/sortBy";

import type { ClustersSearchParameters } from "../api/clusterApi";
import { getAllClusters } from "../api/clusterApi";

export function useAllClusters(searchParameters: ClustersSearchParameters) {
  return useQuery({
    queryKey: ["getAllClusters", searchParameters],
    queryFn: () => getAllClusters(searchParameters),
    select: (data) => sortBy(data.content, (cluster) => cluster.name.toLowerCase()),
  });
}
