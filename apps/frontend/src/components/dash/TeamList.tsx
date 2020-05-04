import React, { useEffect } from "react"
import { ProductTeam, TeamType } from '../../constants'
import { getAllTeams } from '../../api/teamApi'
import { useTable } from '../../util/hooks'
import { Cell, HeadCell, Row, Table } from '../common/Table'
import { intl } from '../../util/intl/intl'
import { HeadingLarge } from 'baseui/typography'
import RouteLink from '../common/RouteLink'
import { getAllProductAreas } from '../../api'

export enum TeamSize {
  EMPTY = '0_0',
  UP_TO_5 = '1_6',
  UP_TO_10 = '6_11',
  UP_TO_20 = '11_21',
  OVER_20 = '21_1000'
}

export const TeamList = (props: { teamType?: TeamType, teamSize?: TeamSize }) => {
  const {teamSize, teamType} = props
  const [teamList, setTeamList] = React.useState<ProductTeam[]>([])
  const [paList, setPaList] = React.useState<Record<string, string>>({})
  const [filtered, setFiltered] = React.useState<ProductTeam[]>([])

  const [table, sortColumn] = useTable<ProductTeam, keyof ProductTeam>(filtered, {
      useDefaultStringCompare: true,
      initialSortColumn: 'name',
      sorting: {
        members: (a, b) => b.members.length - a.members.length,
        productAreaId: (a, b) => (paList[a.productAreaId] || '').localeCompare(paList[b.productAreaId] || '')

      }
    }
  )
  const filter = (list: ProductTeam[]) => {
    if (teamType) {
      list = list.filter(t => t.teamType === teamType)
    }
    if (teamSize) {
      const from = parseInt(teamSize.substr(0, teamSize.indexOf('_')))
      const to = parseInt(teamSize.substr(teamSize.indexOf('_') + 1))
      list = list.filter(t => t.members.length >= from && t.members.length < to)
    }
    return list
  }

  useEffect(() => {
    (async () => {
      setTeamList((await getAllTeams()).content)
      const pas: Record<string, string> = {};
      (await getAllProductAreas()).content.forEach(pa => pas[pa.id] = pa.name)
      setPaList(pas)
    })()
  }, [])

  useEffect(() => setFiltered(filter(teamList)), [teamList, teamSize, teamType])

  return (
    <>
      <HeadingLarge>Teams ({table.data.length})</HeadingLarge>
      <Table emptyText={'teams'} headers={
        <>
          <HeadCell title='Navn' column='name' tableState={[table, sortColumn]}/>
          <HeadCell title='Område' column='productAreaId' tableState={[table, sortColumn]}/>
          <HeadCell title='Type' column='teamType' tableState={[table, sortColumn]}/>
          <HeadCell title='Medlemmer' column='members' tableState={[table, sortColumn]}/>
        </>
      }>
        {table.data.map(team =>
          <Row key={team.id}>
            <Cell><RouteLink href={`/team/${team.id}`}>{team.name}</RouteLink></Cell>
            <Cell><RouteLink href={`/productarea/${team.productAreaId}`}>{paList[team.productAreaId]}</RouteLink></Cell>
            <Cell>{intl[team.teamType]}</Cell>
            <Cell>{team.members.length}</Cell>
          </Row>)}
      </Table>
    </>
  )
}
