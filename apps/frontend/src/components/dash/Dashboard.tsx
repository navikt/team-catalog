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

export const getDashboard = async () => {
  return (await axios.get<DashData>(`${env.teamCatalogBaseUrl}/dash`)).data;
};

const spacing = theme.sizing.scale600

export const Dashboard = () => {
  const [dash, setDash] = useState<DashData>()

  useEffect(() => {
    (async () => {
      setDash(await getDashboard())
    })()
  }, [])

  if (!dash) return <Spinner size={theme.sizing.scale750}/>

  return (
    <Block marginRight={spacing}>
      <Block display='flex' flexWrap justifyContent='space-between' width='650px'>

        <RouteLink href={`/productarea`} hideUnderline>
          <TextBox title='Områder' value={dash.productAreas}
                   icon={faBuilding}/>
        </RouteLink>

        <RouteLink href={`/team`} hideUnderline>
          <TextBox title='Registrerte teams' value={dash.teams}
                   icon={faUsers} subtext={`Team redigert sist uke: ${dash.teamsEditedLastWeek}`}/>
        </RouteLink>

        <TextBox title='Antall personer tilknyttet team' icon={faHouseUser} value={dash.uniqueResourcesInATeam}
                 subtext={`Antall medlemskap: ${dash.totalResources}`}/>
      </Block>

      <Block>
        <Block width='100%' marginTop={spacing}>
          <Chart title='Antall medlemmer per team'
                 data={[
                   {label: 'Ingen medlemmer', size: dash.teamEmpty},
                   {label: 'Opp til 5 medlemmer', size: dash.teamUpTo5},
                   {label: 'Opp til 10 medlemmer', size: dash.teamUpTo10},
                   {label: 'Opp til 20 medlemmer', size: dash.teamUpTo20},
                   {label: 'Over 20 medlemmer', size: dash.teamOver20}
                 ]} size={100}
          />
        </Block>

        <Block width='100%' marginTop={spacing}>
          <Chart title='Team typer' leftLegend
                 data={dash.teamTypes
                 .map(t => ({label: intl[t.type], size: t.count}))
                 .sort(((a, b) => b.size - a.size))
                 } size={100}/>
        </Block>

        <Block width='100%' marginTop={spacing}>
          <Chart title='Roller i team'
                 total={dash.totalResources}
                 data={dash.roles
                 .map(r => ({label: intl[r.role], size: r.count}))
                 .sort(((a, b) => b.size - a.size))
                 } size={100}
          />
        </Block>
      </Block>
    </Block>
  )
}

