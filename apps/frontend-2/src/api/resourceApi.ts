import axios from "axios";

import type { Cluster, PageResponse, ProductArea, ProductTeam, Resource, ResourceUnits } from "../constants";
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
  teams: ProductTeam[];
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
