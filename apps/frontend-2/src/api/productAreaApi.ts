import axios from "axios";

import type { PageResponse, ProductArea, ProductAreaFormValues } from "../constants";
import { ampli } from "../services/Amplitude";
import { env } from "../util/env";

export const deleteArea = async (areaId: string) => {
  await axios.delete(`${env.teamCatalogBaseUrl}/productarea/${areaId}`);
};

export const searchProductAreas = async (searchTerm: string) => {
  return (await axios.get<PageResponse<ProductArea>>(`${env.teamCatalogBaseUrl}/productarea/search/${searchTerm}`))
    .data;
};

export const getAllProductAreas = async (status: string) => {
  const { data } = await axios.get<PageResponse<ProductArea>>(`${env.teamCatalogBaseUrl}/productarea?status=` + status);
  return data;
};

export const getProductArea = async (productareaId: string) => {
  const { data } = await axios.get<ProductArea>(`${env.teamCatalogBaseUrl}/productarea/${productareaId}`);
  return data;
};

export const createProductArea = async (productarea: ProductAreaFormValues) => {
  try {
    ampli.logEvent("teamkatalog_create_productarea");
    return (await axios.post<ProductArea>(`${env.teamCatalogBaseUrl}/productarea`, productarea)).data;
  } catch (error: any) {
    if (error.response.data.message.includes("alreadyExist")) {
      return "Området eksisterer allerede. Endre i eksisterende klynge ved behov.";
    }
    return error.response.data.message;
  }
};

export const editProductArea = async (productarea: ProductAreaFormValues) => {
  ampli.logEvent("teamkatalog_edit_productarea");
  return (await axios.put<ProductArea>(`${env.teamCatalogBaseUrl}/productarea/${productarea.id}`, productarea)).data;
};
