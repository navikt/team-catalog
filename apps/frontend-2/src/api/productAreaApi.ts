import axios from 'axios'
import { AreaType, PageResponse, ProductArea, ProductAreaFormValues, ProductAreaOwnerGroupFormValues, Status } from '../constants'
import { env } from '../util/env'
import { ampli } from '../services/Amplitude'
import { useEffect, useState } from 'react'

export const deleteArea = async (areaId: string) => {
  await axios.delete(`${env.teamCatalogBaseUrl}/productarea/${areaId}`)
}

export const getAllProductAreas = async (status: string) => {
  const data = (await axios.get<PageResponse<ProductArea>>(`${env.teamCatalogBaseUrl}/productarea?status=` + status)).data
  return data
}

export const getProductArea = async (productareaId: string) => {
  const data = (await axios.get<ProductArea>(`${env.teamCatalogBaseUrl}/productarea/${productareaId}`)).data
  return data
}

export const createProductArea = async (productarea: ProductAreaFormValues) => {
  try {
    ampli.logEvent('teamkatalog_create_productarea')
    return (await axios.post<ProductArea>(`${env.teamCatalogBaseUrl}/productarea`, productarea)).data
  } catch (error: any) {
    if (error.response.data.message.includes('alreadyExist')) {
      return 'Området eksisterer allerede. Endre i eksisterende klynge ved behov.'
    }
    return error.response.data.message
  }
}

export const editProductArea = async (productarea: ProductAreaFormValues) => {
  ampli.logEvent('teamkatalog_edit_productarea')
  return (await axios.put<ProductArea>(`${env.teamCatalogBaseUrl}/productarea/${productarea.id}`, productarea)).data
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
