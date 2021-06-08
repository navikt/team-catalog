import {useEffect, useState} from 'react'
import axios from "axios"
import { PageResponse } from '../constants'
import { env } from 'process'
import { OrgEnhet, OrgEnhetOrganisering, HierarkiData } from '../pages/OrgMainPage'
import {array} from "yup";




const getOrg = async (orgId: string) => {
  const baseURL = env.teamCatalogBaseUrl ?? "/api"
  return (await axios.get<OrgEnhet>(`${baseURL}/org/${orgId}`)).data
}


const getHierarki:(orgId: string) => Promise<HierarkiData[]> = async (orgId: string) => {
  const org = await getOrg(orgId)
  const over = org.organiseringer.find(o => o.retning === "over")
    if(over){
      const overenhet: HierarkiData = {
        navn:over.organisasjonsenhet.navn,
        id:over.organisasjonsenhet.agressoId
      }
      const x = await getHierarki(over.organisasjonsenhet.agressoId)
      return [...x, overenhet]
    }
  return [] as HierarkiData[]
}


export const useOrg = (orgId: string) => {
  const [org, setOrg] = useState<OrgEnhet>()
  const [orgHierarki, setOrgHierarki] = useState<HierarkiData[]>([])

  useEffect(() => {
    if(!orgId){
      setOrg(undefined)
    }
    getOrg(orgId).then(r => {
      setOrg(r)
    })
    getHierarki(orgId).then(x => {
      setOrgHierarki(x)
    })

  }, [orgId])
  return [org, orgHierarki]
}
