import type { SortState } from "@navikt/ds-react";
import sortBy from "lodash/sortBy";
import { useState } from "react";

export function useTableSort(defaultSortState?: SortState) {
  const [sort, setSort] = useState<SortState | undefined>(defaultSortState);

  const handleSortChange = (sortKey: string | undefined) => {
    if (sortKey) {
      setSort({
        orderBy: sortKey,
        direction: sort && sortKey === sort.orderBy && sort.direction === "ascending" ? "descending" : "ascending",
      });
    } else {
      setSort(undefined);
    }
  };

  return {
    sort,
    handleSortChange,
    sortDataBykey: defaultSortFunction,
  };
}

function defaultSortFunction<D>(data: D[], sort?: SortState) {
  if (!sort) {
    return data;
  }
  const { orderBy, direction } = sort;

  const sortedMembersAscending = sortBy(data, orderBy);
  const reversed = direction === "descending";

  return reversed ? sortedMembersAscending.reverse() : sortedMembersAscending;
}
