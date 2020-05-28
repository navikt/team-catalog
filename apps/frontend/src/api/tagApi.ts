import {useDebouncedState} from "../util/hooks";
import * as React from "react";
import {Option} from "baseui/select";
import axios from "axios";
import {PageResponse} from "../constants";
import {env} from "../util/env";

export const searchTag = async (tag: string) => {
  return (await axios.get<PageResponse<string>>(`${env.teamCatalogBaseUrl}/tag/search/${tag}`)).data;
};

export const mapTagToOption = (tag: string) => ({id: tag, label: tag});

export const useTagSearch = () => {
  const [tagSearch, setTagSearch] = useDebouncedState<string>("", 200);
  const [searchResult, setSearchResult] = React.useState<Option[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    (async () => {
      if (tagSearch && tagSearch.length > 2) {
        setLoading(true);
        const res = await searchTag(tagSearch);
        let options: Option[] = res.content.map(mapTagToOption);
        setSearchResult(options);
        setLoading(false);
      }
    })()
  }, [tagSearch]);

  return [searchResult, setTagSearch, loading] as [Option[], React.Dispatch<React.SetStateAction<string>>, boolean];
};
