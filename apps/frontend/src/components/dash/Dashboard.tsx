import React, { useEffect, useReducer, useState } from "react"
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
import { StatefulTooltip } from 'baseui/tooltip'

interface DashData {
  productAreas: number
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
  resources: number
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

export const DashboardPage = (props: RouteComponentProps<PathProps>) => {
  const params = props.match.params
  if (!params.filter || !params.filterValue) return <Dashboard/>

  if (params.filter === 'teamsize') return <TeamList teamSize={params.filterValue as TeamSize}/>
  if (params.filter === 'teamext') return <TeamList teamExt={params.filterValue as TeamExt}/>
  if (params.filter === 'teamtype') return <TeamList teamType={params.filterValue as TeamType}/>
  if (params.filter === 'role') return <MemberList role={params.filterValue as TeamRole}/>
  return <></>
}

const DashboardImpl = (props: RouteComponentProps) => {
  const [dash, setDash] = useState<DashData>()

  useEffect(() => {
    (async () => {
      setDash(await getDashboard())
    })()
  }, [])

  if (!dash) return <Spinner size={theme.sizing.scale750}/>

  const teamSizeClick = (size: TeamSize) => () => props.history.push(`/dashboard/teams/teamsize/${size}`)
  const teamExtClick = (ext: TeamExt) => () => props.history.push(`/dashboard/teams/teamext/${ext}`)
  const teamTypeClick = (type: TeamType) => () => props.history.push(`/dashboard/teams/teamtype/${type}`)
  const roleClick = (role: TeamRole) => () => props.history.push(`/dashboard/members/role/${role}`)

  const chartSize = 85

  const chartProps = {
    marginTop: spacing,
    flex: `1 1 ${300 + chartSize * 2}px`,
    marginRight: spacing
  }

  return (
    <Block>
      <Block display='flex' width='100%' justifyContent='space-between'>

        <RouteLink href={`/productarea`} hideUnderline>
          <TextBox title='Områder' value={dash.productAreas}
                   icon={faBuilding}/>
        </RouteLink>

        <Block marginRight={spacing}/>

        <RouteLink href={`/team`} hideUnderline>
          <TextBox title='Team' value={dash.teams}
                   icon={faUsers} subtext={`Team redigert sist uke: ${dash.teamsEditedLastWeek}`}/>
        </RouteLink>

        <Block marginRight={spacing}/>

        <TextBox title='Personer tilknyttet team' icon={faHouseUser} value={dash.uniqueResourcesInATeam}
                 subtext={`Medlemskap: ${dash.totalResources}`}/>

        <Block marginRight={spacing}/>

        <TextBox title='Eksterne' icon={faUserNinja}
                 value={`${dash.uniqueResourcesInATeamExternal} (${
                   (dash.uniqueResourcesInATeamExternal * 100 / (dash.uniqueResourcesInATeam - dash.uniqueResourcesInATeamExternal)).toFixed(0)
                 }%)`}
                 />
      </Block>

      <Block display='flex' flexWrap
             alignItems='stretch'
             marginRight={'-' + spacing}>

        <Block {...chartProps}>
          <Chart title='Antall medlemmer per team'
                 data={[
                   {label: 'Ingen', size: dash.teamEmpty, onClick: teamSizeClick(TeamSize.EMPTY)},
                   {label: 'Opp til 5', size: dash.teamUpTo5, onClick: teamSizeClick(TeamSize.UP_TO_5)},
                   {label: 'Opp til 10', size: dash.teamUpTo10, onClick: teamSizeClick(TeamSize.UP_TO_10)},
                   {label: 'Opp til 20', size: dash.teamUpTo20, onClick: teamSizeClick(TeamSize.UP_TO_20)},
                   {label: 'Over 20', size: dash.teamOver20, onClick: teamSizeClick(TeamSize.OVER_20)}
                 ]} size={chartSize}
          />
        </Block>

        <Block {...chartProps}>
          <Chart title='Team typer'
                 data={dash.teamTypes
                 .map(t => ({label: intl[t.type], size: t.count, onClick: teamTypeClick(t.type)}))
                 .sort(((a, b) => b.size - a.size))
                 } size={chartSize}/>
        </Block>

        <Block {...chartProps}>
          <Chart title='Andel eksterne i team'
                 data={[
                   {label: 'Opp til 25%', size: dash.teamExternalUpto25p, onClick: teamExtClick(TeamExt.UP_TO_25p)},
                   {label: 'Opp til 50%', size: dash.teamExternalUpto50p, onClick: teamExtClick(TeamExt.UP_TO_50p)},
                   {label: 'Opp til 75%', size: dash.teamExternalUpto75p, onClick: teamExtClick(TeamExt.UP_TO_75p)},
                   {label: 'Opp til 100%', size: dash.teamExternalUpto100p, onClick: teamExtClick(TeamExt.UP_TO_100p)}
                 ]} size={chartSize}/>
        </Block>

        <Block {...chartProps}>
          <Chart title='Roller i team'
                 total={dash.totalResources}
                 data={dash.roles
                 .map(r => ({label: intl[r.role], size: r.count, onClick: roleClick(r.role)}))
                 .sort(((a, b) => b.size - a.size))
                 } size={chartSize}
          />
        </Block>

      </Block>
    </Block>
  )
}

// Flipcard
const Flip = (props: { children: React.ReactNode[] }) => {
  const [child, toggle] = useReducer(p => (p + 1) % props.children.length, 0)
  return (
    <Block position='relative'>
      <Block>
        {props.children && !!props.children.length && props.children[child]}
      </Block>

      <div onClick={toggle} style={{position: 'absolute', top: 0, right: 0}}>
        <StatefulTooltip content='Flip'>
          <Block
            width={theme.sizing.scale900}
            height={theme.sizing.scale900}
            $style={{
              cursor: 'pointer',
              background: `linear-gradient(45deg, #ffffff 50%, ${theme.colors.accent200} 50%)`
            }}/>
        </StatefulTooltip>
      </div>
    </Block>
  )
}

export const Dashboard = withRouter(DashboardImpl)
