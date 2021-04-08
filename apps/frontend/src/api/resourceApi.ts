import axios from "axios";
import {Cluster, PageResponse, ProductArea, ProductTeam, Resource, ResourceType} from "../constants";
import {env} from "../util/env";
import {useSearch} from "../util/hooks";

export const searchResource = async (nameSearch: string) => {
  return (await axios.get<PageResponse<Resource>>(`${env.teamCatalogBaseUrl}/resource/search/${nameSearch}`)).data;
}

export const getResourcesForNaisteam = async (naisteam: string) => {
  return (await axios.get<PageResponse<Resource>>(`${env.teamCatalogBaseUrl}/resource/nais/${naisteam}`)).data;
}

export const getResourceOrUndefined = async (resourceId: string) => {
  try {
    return await getResourceById(resourceId)
  } catch (e) {
    return undefined
  }
}

export const getResourceById = async (resourceId: string) => {
  return (await axios.get<Resource>(`${env.teamCatalogBaseUrl}/resource/${resourceId}`)).data;
}

export const getAllMemberships = async (memberId: string) => {
  return (await axios.get<Membership>(`${env.teamCatalogBaseUrl}/member/membership/${memberId}`)).data;
}

export interface Membership {
  teams: ProductTeam[]
  productAreas: ProductArea[]
  clusters: Cluster[]
}

export interface ResourceOption {
  id: string
  navIdent: string
  label: string
  fullName?: string
  email: string
  resourceType?: ResourceType
}

export const mapResourceToOption = (resource: Resource) => ({
  id: resource.navIdent,
  navIdent: resource.navIdent,
  fullName: resource.fullName,
  label: resource.givenName + " " + resource.familyName + " (" + resource.navIdent + ")",
  email: resource.email,
  resourceType: resource.resourceType
} as ResourceOption)

export const useResourceSearch = () => useSearch(async s => (await searchResource(s)).content.map(mapResourceToOption))
