import type { Dispatch, RefObject, SetStateAction } from "react";
import React, { useEffect, useState } from "react";
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

export function useForceUpdate() {
  const [value, setValue] = useState(0);
  return (v?: number) => setValue(v || value + 1);
}

export function useUpdateOnChange(value: any) {
  const update = useForceUpdate();

  useEffect(() => {
    update();
  }, [value]);
}

export function useAwait<T>(p: Promise<T>, setLoading?: Dispatch<SetStateAction<boolean>>) {
  const update = useForceUpdate();

  useEffect(() => {
    (async () => {
      setLoading && setLoading(true);
      await p;
      update();
      setLoading && setLoading(false);
    })();
  }, []);
}

type References = { [id: string]: RefObject<HTMLDivElement> };

export function useRefs(ids: string[]) {
  const references: References =
    ids.reduce((accumulator, value) => {
      accumulator[value] = React.createRef<HTMLDivElement>();
      return accumulator;
    }, {} as References) || {};

  return references;
}

export function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export function useQueryParameters<T extends string>(queryParameter: string) {
  return (useQuery().get(queryParameter) as T) || undefined;
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
