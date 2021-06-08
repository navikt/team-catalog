import {useEffect, useState} from 'react'
import axios from "axios"
import { PageResponse } from '../constants'
import { env } from 'process'
import { OrgEnhet, OrgEnhetOrganisering, HierarkiData } from '../pages/OrgMainPage'




const getOrg = async (orgId: string) => {
  const baseURL = env.teamCatalogBaseUrl ?? "/api"
  return (await axios.get<OrgEnhet>(`${baseURL}/org/${orgId}`)).data
}


const getHierarki:(orgId: string) => Promise<HierarkiData[]> = async (orgId: string) => {
  const org = await getOrg(orgId)
  const overenhet = org.organiseringer.find(o => o.retning === "over")
    if(overenhet){
      const overenhetData: HierarkiData = {
        navn:overenhet.organisasjonsenhet.navn,
        id:overenhet.organisasjonsenhet.agressoId
      }
      const returnData = await getHierarki(overenhet.organisasjonsenhet.agressoId)
      return [...returnData, overenhetData]
    }
  return [] as HierarkiData[]
}


export const useOrg = (orgId: string) => {
  const [org, setOrg] = useState<OrgEnhet>()
  const [orgHierarki, setOrgHierarki] = useState<HierarkiData[]>([])


  useEffect(() => {
    if(!orgId){
      // setOrg(undefined)
      orgId = 'NAV' //TODO dette er em temp fix, må finne en bedre løsning for dette etterhvert
    }
    getOrg(orgId).then(r => {
      setOrg(r)
    })

    getHierarki(orgId).then(x => {  //TODO ikke kalle getHierarki på orgId, men på Id'en fra enheten over
      setOrgHierarki(x)
    })

  }, [orgId])
  return {org, orgHierarki}
}
