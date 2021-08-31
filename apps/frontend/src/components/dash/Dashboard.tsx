import React, {useEffect, useState} from "react"
import axios from 'axios'
import {TeamRole, TeamType} from '../../constants'
import {env} from '../../util/env'
import {theme} from '../../util'
import {Block} from 'baseui/block'
import {faBuilding, faUserCircle, faUserNinja, faUsers} from '@fortawesome/free-solid-svg-icons'
import {intl} from '../../util/intl/intl'
import {Chart} from './Chart'
import {TextBox} from './TextBox'
import RouteLink from '../common/RouteLink'
import {useHistory, useParams} from 'react-router-dom'
import {TeamExt, TeamList, TeamSize} from './TeamList'
import {MemberList} from './MemberList'
import {Spinner} from '../common/Spinner'
import {Changelog} from '../graph/Changelog'

export interface DashData {
  productAreasCount: number
  resources: number
  resourcesDb: number

  total: TeamSummary
  productAreas: ProductAreaSummary[]
  clusters: ClusterSummary[]
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
  teamTypes: Type[]
}

export interface Role {
  role: TeamRole
  count: number
}

export interface Type {
  type: TeamType
  count: number
}

interface PathProps {
  filter?: 'teamsize' | 'teamext' | 'teamtype' | 'role' | 'all' | 'leader',
  filterValue?: string
}

const getDashboard = async () => {
  return (await axios.get<DashData>(`${env.teamCatalogBaseUrl}/dash`)).data;
};

export const useDash = () => {
  const [dash, setDash] = useState<DashData>()

  useEffect(() => {
    getDashboard().then(setDash)
  }, [])

  return dash
}

const spacing = theme.sizing.scale600
const chartCardWith = ["100%", "100%", "100%", "48%"]

export const DashboardPage = () => {
  const {filter, filterValue} = useParams<PathProps>()
  if (!filter) return <Dashboard/>

  if (filter === 'all') return <MemberList/>

  if (!filterValue) return <Dashboard/>

  if (filter === 'teamsize') return <TeamList teamSize={filterValue as TeamSize}/>
  if (filter === 'teamext') return <TeamList teamExt={filterValue as TeamExt}/>
  if (filter === 'teamtype') return <TeamList teamType={filterValue as TeamType}/>
  if (filter === 'role') return <MemberList role={filterValue as TeamRole}/>
  if (filter === 'leader') return <MemberList leaderIdent={filterValue as string}/>
  return <></>
}

export const Dashboard = (props: {productAreaId?: string, clusterId?: string, cards?: boolean, charts?: boolean}) => {
  const noSelect = !(props.cards || props.charts)
  const cards = props.cards || noSelect;
  const charts = props.charts || noSelect;
  const dash = useDash()
  const history = useHistory()

  const productAreaView = !!props.productAreaId
  const clusterView = !!props.clusterId

  const summary = (function () {
    if (productAreaView) {
      const paSummary: ProductAreaSummary | undefined = dash?.productAreas.find((pa) => pa.productAreaId === props.productAreaId);
      return paSummary;
    } else if (clusterView) {
      const clusterSummary: ClusterSummary | undefined = dash?.clusters.find((cl) => cl.clusterId === props.clusterId);
      return clusterSummary;
    }
    return dash?.total;
  })();

  if (!dash || !summary) return <Spinner size={theme.sizing.scale2400}/>

  const queryParam = productAreaView ? `?productAreaId=${props.productAreaId}` :
    clusterView ? `?clusterId=${props.clusterId}` :
      ''

  const teamSizeClick = (size: TeamSize) => () => history.push(`/dashboard/teams/teamsize/${size}${queryParam}`)
  const teamExtClick = (ext: TeamExt) => () => history.push(`/dashboard/teams/teamext/${ext}${queryParam}`)
  const teamTypeClick = (type: TeamType) => () => history.push(`/dashboard/teams/teamtype/${type}${queryParam}`)
  const roleClick = (role: TeamRole) => () => history.push(`/dashboard/members/role/${role}${queryParam}`)

  const chartSize = 80
  return (
    <>
      {cards &&
      <Block display='flex' flexWrap width='100%' justifyContent='space-between'>
        {!(productAreaView || clusterView) && <>
          <Block marginTop={spacing}>
            <RouteLink href={`/area`} hideUnderline>
              <TextBox title='Områder' icon={faBuilding}
                       value={dash.productAreasCount || ''}/>
            </RouteLink>
          </Block>

          <Block marginTop={spacing}>
            <RouteLink href={`/team`} hideUnderline>
              <TextBox title='Team' icon={faUsers}
                       value={summary.teams}
                       subtext={`Redigert sist uke: ${summary.teamsEditedLastWeek}`}/>
            </RouteLink>
          </Block>
        </>}

        <Block marginTop={spacing}>
          <RouteLink href={`/dashboard/members/all${queryParam}`} hideUnderline>
            <TextBox title='Personer' icon={faUserCircle}
                     value={summary.uniqueResources}
                     subtext={`Medlemskap: ${summary.totalResources}`}
            />
          </RouteLink>
        </Block>

        <Block marginTop={spacing}>
          <TextBox title='Eksterne' icon={faUserNinja}
                   value={summary.uniqueResourcesExternal}
                   subtext={`Andel: ${(summary.uniqueResourcesExternal * 100 / (summary.uniqueResources)).toFixed(0)}%`}/>
        </Block>
      </Block>}

      {charts &&
      <Block width='100%' display={['block', 'block', 'block', 'flex']} flexWrap justifyContent='space-between' marginTop={cards ? theme.sizing.scale1000 : undefined}>
        <Block display='flex' flexDirection='column' width={chartCardWith}>
          <Chart title='Teamtyper' size={chartSize}
                 data={summary.teamTypes
                 .map(t => ({label: intl[t.type], size: t.count, onClick: teamTypeClick(t.type)}))
                 .sort(((a, b) => b.size - a.size))
                 }
          />

          <Block marginTop={spacing}>
            <Chart title='Antall medlemmer per team' size={chartSize}
                   data={[
                     {label: 'Ingen', size: summary.teamEmpty, onClick: teamSizeClick(TeamSize.EMPTY)},
                     {label: 'Opp til 5', size: summary.teamUpTo5, onClick: teamSizeClick(TeamSize.UP_TO_5)},
                     {label: 'Opp til 10', size: summary.teamUpTo10, onClick: teamSizeClick(TeamSize.UP_TO_10)},
                     {label: 'Opp til 20', size: summary.teamUpTo20, onClick: teamSizeClick(TeamSize.UP_TO_20)},
                     {label: 'Over 20', size: summary.teamOver20, onClick: teamSizeClick(TeamSize.OVER_20)}
                   ]}/>
          </Block>

          <Block marginTop={spacing}>
            <Chart title='Andel eksterne i team' size={chartSize}
                   data={[
                     {label: '0%', size: summary.teamExternal0p, onClick: teamExtClick(TeamExt._0p)},
                     {label: 'Opp til 25%', size: summary.teamExternalUpto25p, onClick: teamExtClick(TeamExt.UP_TO_25p)},
                     {label: 'Opp til 50%', size: summary.teamExternalUpto50p, onClick: teamExtClick(TeamExt.UP_TO_50p)},
                     {label: 'Opp til 75%', size: summary.teamExternalUpto75p, onClick: teamExtClick(TeamExt.UP_TO_75p)},
                     {label: 'Opp til 100%', size: summary.teamExternalUpto100p, onClick: teamExtClick(TeamExt.UP_TO_100p)}
                   ]}/>
          </Block>

        </Block>

        <Block flexDirection='column' width={chartCardWith} flexWrap marginTop={[spacing, spacing, spacing, '0']}>
          <Chart title='Roller i team' size={chartSize}
                 total={summary.totalResources}
                 data={summary.roles
                 .map(r => ({label: intl[r.role], size: r.count, onClick: roleClick(r.role)}))
                 .sort(((a, b) => b.size - a.size))
                 }/>
        </Block>

        {!clusterView && <Changelog days={30} productAreaId={props.productAreaId}/>}

      </Block>
      }
    </>
  )
}
