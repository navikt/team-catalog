import React, { useEffect, useState } from "react"
import axios from 'axios'
import { TeamRole, TeamType } from '../../constants'
import { env } from '../../util/env'
import { Spinner } from 'baseui/spinner'
import { theme } from '../../util'
import { Block } from 'baseui/block'
import { faBuilding, faHouseUser, faUsers } from '@fortawesome/free-solid-svg-icons'
import { intl } from '../../util/intl/intl'
import { Chart } from './Chart'
import { TextBox } from './TextBox'
import RouteLink from '../common/RouteLink'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { TeamList, TeamSize } from './TeamList'
import { MemberList } from './MemberList'

interface DashData {
  productAreas: number
  teams: number
  teamsEditedLastWeek: number
  teamEmpty: number
  teamUpTo5: number
  teamUpTo10: number
  teamUpTo20: number
  teamOver20: number
  uniqueResourcesInATeam: number
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
  filter?: 'teamsize' | 'teamtype' | 'role',
  filterValue?: string
}

export const getDashboard = async () => {
  return (await axios.get<DashData>(`${env.teamCatalogBaseUrl}/dash`)).data;
};

const spacing = theme.sizing.scale600

export const DashboardPage = (props: RouteComponentProps<PathProps>) => {
  const params = props.match.params
  if (!params.filter || !params.filterValue) return <Dashboard />

  if (params.filter === 'teamsize') return <TeamList teamSize={params.filterValue as TeamSize} />
  if (params.filter === 'teamtype') return <TeamList teamType={params.filterValue as TeamType} />
  if (params.filter === 'role') return <MemberList role={params.filterValue as TeamRole} />
  return <></>
}

const DashboardImpl = (props: RouteComponentProps) => {
  const [dash, setDash] = useState<DashData>()

  useEffect(() => {
    (async () => {
      setDash(await getDashboard())
    })()
  }, [])

  if (!dash) return <Spinner size={theme.sizing.scale750} />

  const teamSizeClick = (size: TeamSize) => () => props.history.push(`/dashboard/teams/teamsize/${size}`)
  const teamTypeClick = (type: TeamType) => () => props.history.push(`/dashboard/teams/teamtype/${type}`)
  const roleClick = (role: TeamRole) => () => props.history.push(`/dashboard/members/role/${role}`)

  return (
    <Block marginRight={['0', '0', '0', spacing]}>
      <Block display='flex' flexWrap justifyContent='space-between' width='650px'>

        <RouteLink href={`/productarea`} hideUnderline>
          <TextBox title='Områder' value={dash.productAreas}
            icon={faBuilding} />
        </RouteLink>

        <RouteLink href={`/team`} hideUnderline>
          <TextBox title='Registrerte teams' value={dash.teams}
            icon={faUsers} subtext={`Team redigert sist uke: ${dash.teamsEditedLastWeek}`} />
        </RouteLink>

        <TextBox title='Antall personer tilknyttet team' icon={faHouseUser} value={dash.uniqueResourcesInATeam}
          subtext={`Antall medlemskap: ${dash.totalResources}`} />
      </Block>

      <Block>
        <Block width='100%' marginTop={spacing}>
          <Chart title='Antall medlemmer per team'
            data={[
              { label: 'Ingen medlemmer', size: dash.teamEmpty, onClick: teamSizeClick(TeamSize.EMPTY) },
              { label: 'Opp til 5 medlemmer', size: dash.teamUpTo5, onClick: teamSizeClick(TeamSize.UP_TO_5) },
              { label: 'Opp til 10 medlemmer', size: dash.teamUpTo10, onClick: teamSizeClick(TeamSize.UP_TO_10) },
              { label: 'Opp til 20 medlemmer', size: dash.teamUpTo20, onClick: teamSizeClick(TeamSize.UP_TO_20) },
              { label: 'Over 20 medlemmer', size: dash.teamOver20, onClick: teamSizeClick(TeamSize.OVER_20) }
            ]} size={100}
          />
        </Block>

        <Block width='100%' marginTop={spacing}>
          <Chart title='Team typer' leftLegend
            data={dash.teamTypes
              .map(t => ({ label: intl[t.type], size: t.count, onClick: teamTypeClick(t.type) }))
              .sort(((a, b) => b.size - a.size))
            } size={100} />
        </Block>

        <Block width='100%' marginTop={spacing}>
          <Chart title='Roller i team'
            total={dash.totalResources}
            data={dash.roles
              .map(r => ({ label: intl[r.role], size: r.count, onClick: roleClick(r.role) }))
              .sort(((a, b) => b.size - a.size))
            } size={100}
          />
        </Block>
      </Block>
    </Block>
  )
}

export const Dashboard = withRouter(DashboardImpl)
