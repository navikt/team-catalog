import type { Dispatch, SetStateAction } from "react";
import type React from "react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export function useDebouncedState<T>(initialValue: T, delay: number): [T, Dispatch<SetStateAction<T>>, T] {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  // value returned as actual non-debounced value to be used in inputfields etc
  return [debouncedValue, setValue, value];
}

export function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export const useSearch = <T>(searchFunction: (term: string) => Promise<T[]>) => {
  const [search, setSearch] = useDebouncedState<string>("", 200);
  const [searchResult, setSearchResult] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    (async () => {
      if (search && search.length > 2) {
        setLoading(true);
        setSearchResult(await searchFunction(search));
        setLoading(false);
      }
    })();
  }, [search]);
  return [searchResult, setSearch, loading] as [T[], React.Dispatch<React.SetStateAction<string>>, boolean];
};
