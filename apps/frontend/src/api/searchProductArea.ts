import axios from "axios";
import { PageResponse, ProductArea, ProductAreaFormValues } from "../constants";
import { env } from "../util/env";

export const getAllProductAreas = async () => {
  const data = (await axios.get<PageResponse<ProductArea>>(`${env.teamCatalogBaseUrl}/productarea`)).data;
  return data;
};

export const getProductArea = async (productareaId: string) => {
  const data = (await axios.get<ProductArea>(`${env.teamCatalogBaseUrl}/productarea/${productareaId}`)).data;
  return data;
};

export const createProductArea = async (productarea: ProductAreaFormValues) => {
  return (await axios.post<ProductArea>(`${env.teamCatalogBaseUrl}/productarea`, productarea)).data;
};

export const editProductArea = async (productarea: ProductAreaFormValues) => {
  return (await axios.put<ProductArea>(`${env.teamCatalogBaseUrl}/productarea/${productarea.id}`, productarea)).data;
};

export const searchProductArea = async (productAreaName: string) => {
  return (await axios.get<PageResponse<ProductArea>>(`${env.teamCatalogBaseUrl}/productarea/search/${productAreaName}`)).data;
};

export const mapProductAreaToFormValues = (productArea?: ProductArea) => {
  const productAreaForm: ProductAreaFormValues = {
    name: productArea?.name || '',
    description: productArea?.description || '',
    tags: productArea?.tags || [],
    members: productArea?.members.map((m) => ({
      navIdent: m.navIdent,
      description: m.description || "",
      fullName: m.resource.fullName,
      resourceType: m.resource.resourceType
    })) || [],
  }
  return productAreaForm
}
