import React, { useEffect, useState } from "react"
import axios from 'axios'
import { TeamRole, TeamType } from '../../constants'
import { env } from '../../util/env'
import { Spinner } from 'baseui/spinner'
import { theme } from '../../util'
import { Block } from 'baseui/block'
import { faBuilding, faHouseUser, faUserNinja, faUsers } from '@fortawesome/free-solid-svg-icons'
import { intl } from '../../util/intl/intl'
import { Chart } from './Chart'
import { TextBox } from './TextBox'
import RouteLink from '../common/RouteLink'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { TeamExt, TeamList, TeamSize } from './TeamList'
import { MemberList } from './MemberList'

interface DashData {
  productAreasCount: number
  resources: number
  resourcesDb: number

  total: TeamSummary
  productAreas: TeamSummary[]
}

interface TeamSummary {
  productAreaId: string
  teams: number
  teamsEditedLastWeek: number
  teamEmpty: number
  teamUpTo5: number
  teamUpTo10: number
  teamUpTo20: number
  teamOver20: number
  teamExternalUpto25p: number
  teamExternalUpto50p: number
  teamExternalUpto75p: number
  teamExternalUpto100p: number
  uniqueResourcesInATeam: number
  uniqueResourcesInATeamExternal: number
  totalResources: number
  roles: Role[]
  teamTypes: Type[]
}

interface Role {
  role: TeamRole
  count: number
}

interface Type {
  type: TeamType
  count: number
}

interface PathProps {
  filter?: 'teamsize' | 'teamext' | 'teamtype' | 'role',
  filterValue?: string
}

export const getDashboard = async () => {
  return (await axios.get<DashData>(`${env.teamCatalogBaseUrl}/dash`)).data;
};

const spacing = theme.sizing.scale600
const chartCardWith = ["100%", "100%", "100%", "48%"]

export const DashboardPage = (props: RouteComponentProps<PathProps>) => {
  const params = props.match.params
  if (!params.filter || !params.filterValue) return <Dashboard/>

  if (params.filter === 'teamsize') return <TeamList teamSize={params.filterValue as TeamSize}/>
  if (params.filter === 'teamext') return <TeamList teamExt={params.filterValue as TeamExt}/>
  if (params.filter === 'teamtype') return <TeamList teamType={params.filterValue as TeamType}/>
  if (params.filter === 'role') return <MemberList role={params.filterValue as TeamRole}/>
  return <></>
}

const DashboardImpl = (props: RouteComponentProps & { productAreaId?: string, cards?: boolean, charts?: boolean }) => {
  const cards = props.cards || (!props.cards && !props.charts);
  const charts = props.charts || (!props.cards && !props.charts);
  const [dash, setDash] = useState<DashData>()

  const productAreaView = !!props.productAreaId
  const summary = productAreaView ? dash?.productAreas.find(pa => pa.productAreaId === props.productAreaId) : dash?.total

  useEffect(() => {
    getDashboard().then(setDash)
  }, [])

  if (!dash || !summary) return <Spinner size={theme.sizing.scale750}/>

  const poQueryParam = productAreaView ? `?productAreaId=${props.productAreaId}` : ''

  const teamSizeClick = (size: TeamSize) => () => props.history.push(`/dashboard/teams/teamsize/${size}${poQueryParam}`)
  const teamExtClick = (ext: TeamExt) => () => props.history.push(`/dashboard/teams/teamext/${ext}${poQueryParam}`)
  const teamTypeClick = (type: TeamType) => () => props.history.push(`/dashboard/teams/teamtype/${type}${poQueryParam}`)
  const roleClick = (role: TeamRole) => () => props.history.push(`/dashboard/members/role/${role}${poQueryParam}`)

  const chartSize = 80
  return (
    <>
      {cards &&
      <Block display='flex' flexWrap width='100%' justifyContent='space-between'>
        {!props.productAreaId && <>
          <Block marginTop={spacing}>
            <RouteLink href={`/productarea`} hideUnderline>
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
          <TextBox title='Personer' icon={faHouseUser}
                   value={summary.uniqueResourcesInATeam}
                   subtext={`Medlemskap: ${summary.totalResources}`}/>
        </Block>

        <Block marginTop={spacing}>
          <TextBox title='Eksterne' icon={faUserNinja}
                   value={summary.uniqueResourcesInATeamExternal}
                   subtext={`Andel: ${(summary.uniqueResourcesInATeamExternal * 100 / (summary.uniqueResourcesInATeam)).toFixed(0)}%`}/>
        </Block>
      </Block>}

      {charts &&
      <Block width='100%' display={['block', 'block', 'block', 'flex']} flexWrap justifyContent='space-between' marginTop={theme.sizing.scale1000}>
        <Block display='flex' flexDirection='column' width={chartCardWith}>
          <Chart title='Team typer' size={chartSize}
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

      </Block>
      }
    </>
  )
}


export const Dashboard = withRouter(DashboardImpl)
