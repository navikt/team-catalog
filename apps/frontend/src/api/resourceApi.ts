import * as React from "react";
import axios from "axios";
import { PageResponse, Resource } from "../constants";
import { env } from "../util/env";
import { useDebouncedState } from "../util/hooks";
import { Option } from "baseui/select";

export const searchResource = async (nameSearch: string) => {
  return (await axios.get<PageResponse<Resource>>(`${env.teamCatalogBaseUrl}/resource/search/${nameSearch}`)).data;
};

export const getResourceById = async (resourceId: string) => {
  return (await axios.get<Resource>(`${env.teamCatalogBaseUrl}/resource/${resourceId}`)).data;
};

export const mapResourceToOption = (resource: Resource) => ({
  id: resource.navIdent,
  name: resource.givenName + " " + resource.familyName,
  display: resource.givenName + " " + resource.familyName + " (" + resource.navIdent + ")",
  resourceType:  resource.resourceType
});

export const useResourceSearch = () => {
  const [resourceSearch, setResourceSearch] = useDebouncedState<string>("", 300);
  const [searchResult, setResourceSearchResult] = React.useState<Option[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    (async () => {
      if (resourceSearch && resourceSearch.length > 2) {
        setLoading(true);
        const res = await searchResource(resourceSearch);
        let options: Option[] = res.content.map(mapResourceToOption);
        setResourceSearchResult(options);
        setLoading(false);
      }
    })();
  }, [resourceSearch]);

  return [searchResult, setResourceSearch, loading] as [Option[], React.Dispatch<React.SetStateAction<string>>, boolean];
};
