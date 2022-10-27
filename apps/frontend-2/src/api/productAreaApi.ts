import axios from 'axios'
import { useEffect, useState } from 'react'

import type { PageResponse, ProductArea, ProductAreaFormValues, ProductAreaOwnerGroupFormValues} from '../constants';
import { AreaType, Status } from '../constants'
import { ampli } from '../services/Amplitude'
import { env } from '../util/env'

export const deleteArea = async (areaId: string) => {
  await axios.delete(`${environment.teamCatalogBaseUrl}/productarea/${areaId}`)
}

export const getAllProductAreas = async (status: string) => {
  const {data} = await axios.get<PageResponse<ProductArea>>(`${environment.teamCatalogBaseUrl}/productarea?status=` + status)
  return data
}

export const getProductArea = async (productareaId: string) => {
  const {data} = await axios.get<ProductArea>(`${environment.teamCatalogBaseUrl}/productarea/${productareaId}`)
  return data
}

export const createProductArea = async (productarea: ProductAreaFormValues) => {
  try {
    ampli.logEvent('teamkatalog_create_productarea')
    return (await axios.post<ProductArea>(`${environment.teamCatalogBaseUrl}/productarea`, productarea)).data
  } catch (error: any) {
    if (error.response.data.message.includes('alreadyExist')) {
      return 'Området eksisterer allerede. Endre i eksisterende klynge ved behov.'
    }
    return error.response.data.message
  }
}

export const editProductArea = async (productarea: ProductAreaFormValues) => {
  ampli.logEvent('teamkatalog_edit_productarea')
  return (await axios.put<ProductArea>(`${environment.teamCatalogBaseUrl}/productarea/${productarea.id}`, productarea)).data
}

export const mapProductAreaToFormValues = (productArea?: ProductArea) => {
  const productAreaForm: ProductAreaFormValues = {
    name: productArea?.name || '',
    areaType: productArea?.areaType || AreaType.OTHER,
    description: productArea?.description || '',
    slackChannel: productArea?.slackChannel || '',
    status: productArea?.status || Status.ACTIVE,
    tags: productArea?.tags || [],
    members:
      productArea?.members.map((m) => ({
        navIdent: m.navIdent,
        roles: m.roles || [],
        description: m.description || '',
        fullName: m.resource.fullName || undefined,
        resourceType: m.resource.resourceType || undefined,
      })) || [],
    locations: productArea?.locations || [],
    ownerGroup: (function (): ProductAreaOwnerGroupFormValues | undefined {
      const pog = productArea?.paOwnerGroup
      if (!pog || !pog.ownerResource) return undefined

      return {
        ownerNavId: pog?.ownerResource.navIdent,
        ownerGroupMemberNavIdList: pog?.ownerGroupMemberResourceList.map((it) => it.navIdent),
      }
    })(),
  }
  return productAreaForm
}

export const useAllProductAreas = () => {
  const [productAreas, setProductAreas] = useState<ProductArea[]>([])
  useEffect(() => {
    getAllProductAreas('active').then((r) => setProductAreas(r.content))
  }, [])
  return productAreas
}
