import axios from "axios";

import type {
  OptionType,
  PageResponse,
  ProductArea,
  ProductAreaFormValues,
  ProductAreaOwnerGroupFormValues,
  ProductAreaSubmitValues,
} from "../constants";
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.response.data.message.includes("alreadyExist")) {
      return "Området eksisterer allerede. Endre i eksisterende klynge ved behov.";
    }
    return error.response.data.message;
  }
};

export const putProductArea = async (productAreaId: string, productarea: ProductAreaSubmitValues) => {
  return (await axios.put<ProductArea>(`${env.teamCatalogBaseUrl}/productarea/${productAreaId}`, productarea)).data;
};

export function mapProductAreaToFormValues(productArea?: ProductArea): ProductAreaFormValues {
  let resourceList: OptionType[] = [];
  let ownerResourceId;
  if (productArea && productArea.paOwnerGroup) {
    ownerResourceId = productArea.paOwnerGroup.ownerResource && {
      value: productArea.paOwnerGroup.ownerResource.navIdent,
      label: productArea.paOwnerGroup.ownerResource.fullName,
    };
    resourceList = productArea.paOwnerGroup.ownerGroupMemberResourceList.map((r) => ({
      value: r.navIdent,
      label: r.fullName,
    }));
  }

  return {
    id: productArea?.id,
    name: productArea?.name || "",
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
    ownerGroup: (function (): ProductAreaOwnerGroupFormValues | undefined {
      const pog = productArea?.paOwnerGroup;
      if (!pog || !pog.ownerResource) return undefined;

      return {
        ownerNavId: pog?.ownerResource.navIdent,
        ownerGroupMemberNavIdList: pog?.ownerGroupMemberResourceList.map((it) => it.navIdent),
      };
    })(),
    ownerGroupResourceList: resourceList,
    ownerResourceId: ownerResourceId,
  };
}

export function mapProductAreaToSubmitValues(data: ProductAreaFormValues): ProductAreaSubmitValues {
  const tagsMapped = data.tags.map((t: OptionType) => t.value);
  let ownerNavId;
  const ownerGroupMemberNavIdList =
    data.ownerGroupResourceList.map((r) => {
      return r.value;
    }) || [];

  if (data.ownerResourceId) {
    ownerNavId = data.ownerResourceId.value;
    return {
      id: data?.id,
      name: data.name,
      status: data.status,
      description: data.description,
      areaType: data.areaType,
      slackChannel: data?.slackChannel,
      tags: tagsMapped,
      ownerGroup:
        data.areaType === AreaType.PRODUCT_AREA
          ? {
              ownerNavId: ownerNavId,
              ownerGroupMemberNavIdList: ownerGroupMemberNavIdList,
            }
          : undefined,
    };
  }

  return {
    id: data?.id,
    name: data.name,
    status: data.status,
    description: data.description,
    areaType: data.areaType,
    slackChannel: data?.slackChannel,
    tags: tagsMapped,
  };
}
