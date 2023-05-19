import axios from "axios";

import type { Cluster, ClusterFormValues, ClusterSubmitValues, PageResponse } from "../constants";
import { Status } from "../constants";
import { ampli } from "../services/Amplitude";
import { env } from "../util/env";

export const deleteCluster = async (clusterId: string) => {
  await axios.delete(`${env.teamCatalogBaseUrl}/cluster/${clusterId}`);
};

export type ClustersSearchParameters = {
  status?: Status;
};

export const getAllClusters = async (clustersSearchParameters: ClustersSearchParameters) => {
  return (
    await axios.get<PageResponse<Cluster>>(`${env.teamCatalogBaseUrl}/cluster`, { params: clustersSearchParameters })
  ).data;
};

export const getCluster = async (clusterId: string) => {
  return (await axios.get<Cluster>(`${env.teamCatalogBaseUrl}/cluster/${clusterId}`)).data;
};

export const createCluster = async (cluster: ClusterSubmitValues) => {
  try {
    ampli.logEvent("teamkatalog_create_cluster");
    return (await axios.post<Cluster>(`${env.teamCatalogBaseUrl}/cluster`, cluster)).data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.response.data.message.includes("alreadyExist")) {
      return "Klyngen eksisterer allerede. Endre i eksisterende klynge ved behov.";
    }
    return error.response.data.message;
  }
};

export const editCluster = async (cluster: ClusterSubmitValues) => {
  ampli.logEvent("teamkatalog_edit_cluster");
  return (await axios.put<Cluster>(`${env.teamCatalogBaseUrl}/cluster/${cluster.id}`, cluster)).data;
};

export const searchClusters = async (term: string) => {
  return (await axios.get<PageResponse<Cluster>>(`${env.teamCatalogBaseUrl}/cluster/search/${term}`)).data;
};

export const mapClusterToFormValues = (cluster?: Cluster) => {
  const clusterForm: ClusterFormValues = {
    name: cluster?.name || "",
    description: cluster?.description || "",
    slackChannel: cluster?.slackChannel || "",
    status: cluster?.status || Status.ACTIVE,
    tags: cluster ? cluster.tags.map((t) => ({ value: t, label: t })) : [],
    productAreaId: cluster?.productAreaId || "",
    members:
      cluster?.members.map((m) => ({
        navIdent: m.navIdent,
        roles: m.roles || [],
        description: m.description || "",
        fullName: m.resource.fullName || undefined,
        resourceType: m.resource.resourceType || undefined,
      })) || [],
  };
  return clusterForm;
};

export const mapToOptions = (list: { id: string; name: string }[] | undefined) => {
  return (list ?? []).map((po) => ({ value: po.id, label: po.name }));
};
