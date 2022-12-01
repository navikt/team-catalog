import { useSearch } from "../hooks"; // TODO: Fix this, is broken
import axios from "axios";

import type { PageResponse } from "../constants";
import { env } from "../util/env";

export const searchTag = async (tag: string) => {
  return (await axios.get<PageResponse<string>>(`${env.teamCatalogBaseUrl}/tag/search/${tag}`)).data;
}

export const mapTagToOption = (tag: string) => ({value: tag, label: tag})

export const useTagSearch = () => useSearch(async s => (await searchTag(s)).content.map(mapTagToOption))
