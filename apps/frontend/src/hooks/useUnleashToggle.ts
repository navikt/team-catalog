import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import axios from "axios";

const TCAT_UNLEASH_BASE_PATH = "/frackend/unleash";

type UnleashResponse = {
  isUnleashEnabled: boolean;
};

export const getUnleashEnabled = async (unleashToggleName: string) =>
  (await axios.get<string, AxiosResponse<UnleashResponse>>(`${TCAT_UNLEASH_BASE_PATH}/${unleashToggleName}`)).data;

export function useUnleashToggle(toggleName: string) {
  const qry = useQuery({
    queryFn: () => getUnleashEnabled(toggleName),
    queryKey: ["unleashtoggle", toggleName],
  });
  return qry.data?.isUnleashEnabled ?? false;
}
