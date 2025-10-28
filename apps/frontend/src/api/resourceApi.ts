import axios from "axios";

import type { Cluster, PageResponse, ProductArea, ProductTeamResponse, Resource, ResourceUnits } from "../constants";
import { useSearch } from "../hooks";
import { env } from "../util/env";

export const searchResource = async (nameSearch: string) => {
  return (await axios.get<PageResponse<Resource>>(`${env.teamCatalogBaseUrl}/resource/search/${nameSearch}`)).data;
};

export const getResourceById = async (resourceId?: string) => {
  return (await axios.get<Resource>(`${env.teamCatalogBaseUrl}/resource/${resourceId}`)).data;
};

export const getResourceUnitsById = async (resourceId?: string) => {
  return (await axios.get<ResourceUnits | undefined>(`${env.teamCatalogBaseUrl}/resource/${resourceId}/units`)).data;
};

export const getAllMemberships = async (memberId: string) => {
  return (await axios.get<Membership>(`${env.teamCatalogBaseUrl}/member/membership/${memberId}`)).data;
};

export interface Membership {
  teams: ProductTeamResponse[];
  productAreas: ProductArea[];
  clusters: Cluster[];
}

export const mapResourceToOption = (resource: Resource) => {
  return {
    value: resource.navIdent,
    label: resource.fullName,
    email: resource.email,
  };
};

export const useResourceSearch = () =>
  useSearch(async (s) => (await searchResource(s)).content.map((element) => mapResourceToOption(element)));

export async function performNomSearch(searchString: string): Promise<NomSearchResult[]> {
  const searchQuery = `query searchRessurs($searchString: String!, $ressursFilter: RessursSearchFilter) {
  searchRessurs(term: $searchString, filter: $ressursFilter) {
    navident
    visningsnavn
    sluttdato
  }
}`;

  const ressursFilter = {
    sektorSelection: "ALLE",
    statusSelection: "ALLE",
    limit: "LIMIT_100",
  };

  try {
    const result = await axios.post("/frackend/nom-api/graphql", {
      operationName: "searchRessurs",
      query: searchQuery,
      variables: {
        searchString: searchString,
        ressursFilter: ressursFilter,
      },
    });

    return result.data.data.searchRessurs;
  } catch (error) {
    console.error("NOM ressurs search error:", error);
    throw error;
  }
}

export async function performNomNavidentSearch(navident: string): Promise<NomSearchResult> {
  const ressursQuery = `query ressurs($navident: String) {
  ressurs(where: {navident: $navident}) {
    navident
    visningsnavn
    sluttdato
  }
}`;

  try {
    const result = await axios.post("/frackend/nom-api/graphql", {
      operationName: "ressurs",
      query: ressursQuery,
      variables: {
        navident: navident,
      },
    });

    return result.data.data.ressurs;
  } catch (error) {
    console.error("NOM ressurs navident search error:", error);
    throw error;
  }
}

export type NomSearchResult = {
  navident: string;
  visningsnavn: string;
  sluttdato: string;
};
