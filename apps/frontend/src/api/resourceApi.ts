import * as React from "react";
import axios from "axios";
import { PageResponse, Resource } from "../constants";
import { env } from "../util/env";
import { useDebouncedState } from "../util/hooks";
import { Option } from "baseui/select";

export const searchResource = async (nameSearch: string) => {
  return (await axios.get<PageResponse<Resource>>(`${env.teamCatalogBaseUrl}/resource/search/${nameSearch}`)).data;
};

export const mapResourceToOption = (resource: Resource) => ({
  id: resource.navIdent,
  name: resource.givenName + " " + resource.familyName,
  display: resource.givenName + " " + resource.familyName + " (" + resource.navIdent + ")"
});

export const getResourceImage = async (id: string) => {
  const data = (await axios.get<any>(`https://teamkatalog-api.nais.adeo.no/resource/${id}/photo`)).data;
  return data;
};

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
