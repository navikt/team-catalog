import axios from "axios";
import {PageResponse, ProductArea, ProductAreaFormValues} from "../constants";
import {env} from "../util/env";
import {ampli} from '../services/Amplitude'
import {useEffect, useState} from 'react'

export const getAllProductAreas = async () => {
  const data = (await axios.get<PageResponse<ProductArea>>(`${env.teamCatalogBaseUrl}/productarea`)).data;
  return data;
};

export const getProductArea = async (productareaId: string) => {
  const data = (await axios.get<ProductArea>(`${env.teamCatalogBaseUrl}/productarea/${productareaId}`)).data;
  return data;
};

export const createProductArea = async (productarea: ProductAreaFormValues) => {
  ampli.logEvent("teamkatalog_create_productarea");
  return (await axios.post<ProductArea>(`${env.teamCatalogBaseUrl}/productarea`, productarea)).data;
};

export const editProductArea = async (productarea: ProductAreaFormValues) => {
  ampli.logEvent("teamkatalog_edit_productarea");
  return (await axios.put<ProductArea>(`${env.teamCatalogBaseUrl}/productarea/${productarea.id}`, productarea)).data;
};

export const mapProductAreaToFormValues = (productArea?: ProductArea) => {
  const productAreaForm: ProductAreaFormValues = {
    name: productArea?.name || '',
    description: productArea?.description || '',
    tags: productArea?.tags || [],
    members: productArea?.members.map((m) => ({
      navIdent: m.navIdent,
      roles: m.roles || [],
      description: m.description || "",
      fullName: m.resource.fullName,
      resourceType: m.resource.resourceType
    })) || [],
    locations: productArea?.locations || []
  }
  return productAreaForm
}

export const useAllProductAreas = () => {
  const [productAreas, setProductAreas] = useState<ProductArea[]>([])
  useEffect(() => {
    getAllProductAreas().then(r => setProductAreas(r.content))
  }, [])
  return productAreas
}
