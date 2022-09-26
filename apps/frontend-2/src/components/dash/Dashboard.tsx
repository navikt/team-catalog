import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Cluster, PageResponse, ProductTeam, TeamRole, TeamOwnershipType } from '../../constants'
import { env } from '../../util/env'

export interface DashData {
    teamsCount: number
    clusterCount: number
    productAreasCount: number
    resources: number
    resourcesDb: number
  
    teamsCountPlanned: number
    teamsCountInactive: number
    productAreasCountPlanned: number
    productAreasCountInactive: number
    clusterCountPlanned: number
    clusterCountInactive: number
  
    areaSummaryMap: { [k: string]: ProductAreaSummary2 }
    clusterSummaryMap: { [k: string]: ClusterSummary2 }
    teamSummaryMap: { [k: string]: TeamSummary2 }
    locationSummaryMap: { [k: string]: LocationSummary }
  
    total: TeamSummary
    productAreas: ProductAreaSummary[]
    clusters: ClusterSummary[]
  }
  
  export interface LocationSummary extends Map<String, []> {
    teamCount: number
    resourceCount: number
    monday: { teamCount: number; resourceCount: number }
    tuesday: { teamCount: number; resourceCount: number }
    wednesday: { teamCount: number; resourceCount: number }
    thursday: { teamCount: number; resourceCount: number }
    friday: { teamCount: number; resourceCount: number }
  }
  
  export interface ProductAreaSummary extends TeamSummary {
    productAreaId: string
  }
  
  export interface ProductAreaSummary2 {
    clusterCount: number
    membershipCount: number
    totalTeamCount: number
    uniqueResourcesCount: number
    uniqueResourcesExternal: number
  }
  
  export interface ClusterSummary2 extends Map<String, []> {
    teamCount: number
    totalMembershipCount: number
    totalUniqueResourcesCount: number
    uniqueResourcesExternal: number
  }
  
  interface TeamSummary2 extends Map<String, []> {
    membershipCount: number
    resourcesExternal: number
  }
  
  export interface ProductAreaSummary extends TeamSummary {
    productAreaId: string
  }
  
  export interface ClusterSummary extends TeamSummary {
    clusterId: string
  }
  
  export interface TeamSummary {
    teams: number
    teamsEditedLastWeek: number
    teamEmpty: number
    teamUpTo5: number
    teamUpTo10: number
    teamUpTo20: number
    teamOver20: number
    teamExternal0p: number
    teamExternalUpto25p: number
    teamExternalUpto50p: number
    teamExternalUpto75p: number
    teamExternalUpto100p: number
    uniqueResources: number
    uniqueResourcesExternal: number
    totalResources: number
    roles: Role[]
    teamOwnershipTypes: OwnershipType[]
  }
  
  export interface Role {
    role: TeamRole
    count: number
  }
  
  export interface OwnershipType {
    type: TeamOwnershipType
    count: number
  }

const getDashboard = async () => {
    return (await axios.get<DashData>(`${env.teamCatalogBaseUrl}/dash`)).data
}

export const useDash = () => {
    const [dash, setDash] = React.useState<DashData>()
  
    useEffect(() => {
      getDashboard().then(setDash)
    }, [])
  
    return dash
}

