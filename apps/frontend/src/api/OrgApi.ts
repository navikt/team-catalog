import {useEffect, useState} from 'react'
import axios from "axios"
import { PageResponse } from '../constants'
import { env } from 'process'

const getOrg = async (orgId: string) => {
  console.log({getOrg_input: orgId, envInput: env});
  const baseURL = env.teamCatalogBaseUrl ?? "/api"

  return (await axios.get<any>(`${baseURL}/org/${orgId}`)).data
}


export const useOrg = (orgId: string) => {
  const [org, setOrg] = useState<any>(null)
  useEffect(() => {
    if(!orgId){
      setOrg(null)
    }
    getOrg(orgId).then(r => {
      console.log({getOrgResponse: r})
      setOrg(r)
    })
  }, [orgId])
  return org
}
