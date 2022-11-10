import axios from "axios";

import type { PageResponse } from "../constants";
import { env } from "../util/env";

export const searchTag = async (tag: string) => {
  return (await axios.get<PageResponse<string>>(`${env.teamCatalogBaseUrl}/tag/search/${tag}`)).data;
};
