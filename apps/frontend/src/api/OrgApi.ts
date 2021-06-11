import {useEffect, useState} from 'react'
import axios from "axios"
import { env } from 'process'
import { OrgEnhet, HierarkiData } from '../pages/OrgMainPage'


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
      orgId = 'NAV'
    }
    getOrg(orgId).then(r => {
      setOrg(r)
    })

    getHierarki(orgId).then(x => {
      setOrgHierarki(x)
    })

  }, [orgId])
  return {org, orgHierarki}
}
