import axios from "axios"
import {Cluster, ClusterFormValues, PageResponse, Status} from "../constants"
import {env} from "../util/env"
import {ampli} from '../services/Amplitude'
import {useEffect, useState} from 'react'
import {useSearch} from '../util/hooks'
import {mapToOptions} from './index'

export const deleteCluster = async (clusterId: string) => {
  await axios.delete(`${env.teamCatalogBaseUrl}/cluster/${clusterId}`)
}

export const getAllClusters = async () => {
  return (await axios.get<PageResponse<Cluster>>(`${env.teamCatalogBaseUrl}/cluster`)).data
}

export const getCluster = async (clusterId: string) => {
  return (await axios.get<Cluster>(`${env.teamCatalogBaseUrl}/cluster/${clusterId}`)).data
}

export const createCluster = async (cluster: ClusterFormValues) => {
  try {
    ampli.logEvent("teamkatalog_create_cluster")
    return (await axios.post<Cluster>(`${env.teamCatalogBaseUrl}/cluster`, cluster)).data
  } catch (error: any) {
    if (error.response.data.message.includes("alreadyExist")) {
      return "Klyngen eksisterer allerede. Endre i eksisterende klynge ved behov.";
    }
    return error.response.data.message;
  }
}

export const editCluster = async (cluster: ClusterFormValues) => {
  ampli.logEvent("teamkatalog_edit_cluster")
  return (await axios.put<Cluster>(`${env.teamCatalogBaseUrl}/cluster/${cluster.id}`, cluster)).data
}

export const searchClusters = async (term: string) => {
  return (await axios.get<PageResponse<Cluster>>(`${env.teamCatalogBaseUrl}/cluster/search/${term}`)).data;
}

export const mapClusterToFormValues = (cluster?: Cluster) => {
  const clusterForm: ClusterFormValues = {
    name: cluster?.name || '',
    description: cluster?.description || '',
    slackChannel: cluster?.slackChannel || '',
    status: cluster?.status || Status.ACTIVE,
    tags: cluster?.tags || [],
    productAreaId: cluster?.productAreaId || '',
    members: cluster?.members.map((m) => ({
      navIdent: m.navIdent,
      roles: m.roles || [],
      description: m.description || "",
      fullName: m.resource.fullName || undefined,
      resourceType: m.resource.resourceType || undefined
    })) || []
  }
  return clusterForm
}

export const useAllClusters = () => {
  const [clusters, setClusters] = useState<Cluster[]>([])
  useEffect(() => {
    getAllClusters().then(r => setClusters(r.content))
  }, [])
  return clusters
}

export const useClusters = (ids?: string[]) => {
  const [clusters, setClusters] = useState<Cluster[]>([])
  useEffect(() => {
    if (!ids) {
      setClusters([])
      return
    }
    getAllClusters().then(r => setClusters(r.content.filter(c => ids.indexOf(c.id) >= 0)))
  }, [ids])
  return clusters
}

export const useClustersForProductArea = (id?: string) => {
  const [clusters, setClusters] = useState<Cluster[]>([])
  useEffect(() => {
    if (!id) {
      setClusters([])
      return
    }
    getAllClusters().then(r => setClusters(r.content.filter(c => c.productAreaId === id)))
  }, [id])
  return clusters
}

export const useClustersForResource = (ident?: string) => {
  const [clusters, setClusters] = useState<Cluster[]>([])
  useEffect(() => {
    if (!ident) {
      setClusters([])
      return
    }
    getAllClusters().then(r => setClusters(r.content.filter(c => c.members.filter(m => m.navIdent === ident).length)))
  }, [ident])
  return clusters
}

export const useClusterSearch = () => useSearch(async s => mapToOptions((await searchClusters(s)).content))
