import {useEffect, useState} from 'react'
import axios from "axios"
import { PageResponse } from '../constants'
import { env } from 'process'
import { OrgEnhet, OrgEnhetOrganisering, hierarkiData } from '../pages/OrgMainPage'




const getOrg = async (orgId: string) => {
  // console.log({getOrg_input: orgId, envInput: env});
  const baseURL = env.teamCatalogBaseUrl ?? "/api"

  return (await axios.get<any>(`${baseURL}/org/${orgId}`)).data
}


const getHierarki = async (orgId: string, orgHierarki: Array<any>) => {
  let org:OrgEnhet
  let overenheter: hierarkiData

  getOrg(orgId).then(r => {
    org = r
    org.organiseringer.forEach(function (value){
      if(value.retning === 'over'){
        overenheter = {
          navn:value.organisasjonsenhet.navn,
          id:value.organisasjonsenhet.agressoId
        }
        orgHierarki.push(overenheter)
        getHierarki(value.organisasjonsenhet.agressoId, orgHierarki)
      }
    })
  })
  return orgHierarki
}


export const useOrg = (orgId: string) => {
  const [org, setOrg] = useState<any>(null)
  const [orgHierarki, setOrgHierarki] = useState<hierarkiData[]>([])

  useEffect(() => {
    if(!orgId){
      setOrg(null)
    }
    setOrgHierarki([])
    getOrg(orgId).then(r => {
      // console.log({getOrgResponse: r})
      getHierarki(orgId, orgHierarki).then(x => {
        console.log({getHierarkiResponse: x})
        setOrgHierarki(x)
      })

      setOrg(r)
    })
  }, [orgId])
  // return [org as OrgEnhet, orgHierarki as Array<hierarkiData>]
  return [org, orgHierarki]

}

/*
    const overenheter = []
    const orgBase = getOrg(sekreteraitetID)
    let orgTemp = orgBase
    while hasEnhetOverID(orgtemp)
      const enhetoverID = getEnhetOverID(orgTemp)
      orgTemp = await getOrg(enhetOverID)
      overenheter.push(orgTemp)
    foreach x in overenheter:

      appendOverenhet(orgBase, x)

    setOrg(orgBase)
*/
