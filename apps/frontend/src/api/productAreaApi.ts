import axios from "axios";

import type {
  OptionType,
  PageResponse,
  ProductArea,
  ProductAreaFormValues,
  ProductAreaSubmitValues,
} from "../constants";
import { Role } from "../constants";
import { AreaType, Status } from "../constants";
import { env } from "../util/env";

export const searchProductAreas = async (searchTerm: string) => {
  return (await axios.get<PageResponse<ProductArea>>(`${env.teamCatalogBaseUrl}/productarea/search/${searchTerm}`))
    .data;
};

export type ProductAreasSearchParameters = {
  status?: Status;
};

export const getAllProductAreas = async (searchParameters: ProductAreasSearchParameters) => {
  const { data } = await axios.get<PageResponse<ProductArea>>(`${env.teamCatalogBaseUrl}/productarea`, {
    params: searchParameters,
  });
  return data;
};

export const getProductArea = async (productareaId: string) => {
  const { data } = await axios.get<ProductArea>(`${env.teamCatalogBaseUrl}/productarea/${productareaId}`);
  return data;
};

export const createProductArea = async (productarea: ProductAreaSubmitValues) => {
  try {
    return (await axios.post<ProductArea>(`${env.teamCatalogBaseUrl}/productarea`, productarea)).data;
  } catch (error: any) {
    if (error.response.data.message.includes("alreadyExist")) {
      return "Seksjon eksisterer allerede. Endre i eksisterende klynge ved behov.";
    }
    return error.response.data.message;
  }
};

export const putProductArea = async (productAreaId: string, productarea: ProductAreaSubmitValues) => {
  return (await axios.put<ProductArea>(`${env.teamCatalogBaseUrl}/productarea/${productAreaId}`, productarea)).data;
};

export function mapProductAreaToFormValues(productArea?: ProductArea): ProductAreaFormValues {
  let resourceList: OptionType[] =
    productArea?.ownerGroupNavidentList?.map((it) => ({
      email: undefined,
      value: it,
      label: it,
    })) ?? [];

  debugger;

  return {
    id: productArea?.id,
    name: productArea?.name || "",
    nomId: productArea?.nomId || "",
    areaType: productArea?.areaType || AreaType.OTHER,
    description: productArea?.description || "",
    slackChannel: productArea?.slackChannel || "",
    status: productArea?.status || Status.ACTIVE,
    tags: productArea ? productArea.tags.map((t) => ({ value: t, label: t })) : [],
    members:
      productArea?.members.map((m) => ({
        navIdent: m.navIdent,
        roles: m.roles || [],
        description: m.description || "",
        fullName: m.resource.fullName || undefined,
        resourceType: m.resource.resourceType || undefined,
      })) || [],
    locations: productArea?.locations || [],
    ownerGroupResourceList: resourceList,
  };
}

export function mapProductAreaToSubmitValues(data: ProductAreaFormValues): ProductAreaSubmitValues {
  const tagsMapped = data.tags.map((t: OptionType) => t.value);

  if (data.areaType === AreaType.PRODUCT_AREA) {
    return {
      id: data?.id,
      name: data.name,
      nomId: data.nomId.length === 0 ? undefined : data.nomId,
      status: data.status,
      description: data.description,
      areaType: data.areaType,
      slackChannel: data?.slackChannel,
      tags: tagsMapped,
      ownerGroupNavidentList: data.ownerGroupResourceList.map((it) => it.value),
    };
  }

  return {
    id: data?.id,
    name: data.name,
    nomId: data.nomId,
    status: data.status,
    description: data.description,
    areaType: data.areaType,
    slackChannel: data?.slackChannel,
    tags: tagsMapped,
  };
}
