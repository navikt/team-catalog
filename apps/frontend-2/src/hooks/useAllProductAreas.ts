import sortBy from "lodash/sortBy";
import { useQuery } from "react-query";

import type { ProductAreasSearchParameters } from "../api";
import { getAllProductAreas } from "../api";

export function useAllProductAreas(searchParameters: ProductAreasSearchParameters) {
  return useQuery({
    queryKey: ["getAllProductAreas", searchParameters],
    queryFn: () => getAllProductAreas(searchParameters),
    select: (data) => sortBy(data.content, (productArea) => productArea.name.toLowerCase()),
  });
}
