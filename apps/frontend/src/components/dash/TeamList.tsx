import React, { useEffect } from "react"
import { ProductTeam, TeamType } from '../../constants'
import { getAllTeams } from '../../api/teamApi'
import { useTable } from '../../util/hooks'
import { Cell, HeadCell, Row, Table } from '../common/Table'
import { intl } from '../../util/intl/intl'
import { HeadingLarge } from 'baseui/typography'
import RouteLink from '../common/RouteLink'
import * as _ from 'lodash'

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
  const [filtered, setFiltered] = React.useState<ProductTeam[]>([])

  const [table, sortColumn] = useTable<ProductTeam, keyof ProductTeam>(filtered, {
      useDefaultStringCompare: true,
      initialSortColumn: 'name',
      sorting: {
        members: (a, b) => b.members.length - a.members.length
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
      const res = await getAllTeams()
      if (res.content) {
        setTeamList(res.content)
      }
    })()
  }, [])

  useEffect(() => setFiltered(filter(teamList)), [teamList, teamSize, teamType])

  return (
    <>
      <HeadingLarge>Teams</HeadingLarge>
      <Table emptyText={'teams'} headers={
        <>
          <HeadCell title='Navn' column='name' tableState={[table, sortColumn]}/>
          <HeadCell title='Type' column='teamType' tableState={[table, sortColumn]}/>
          <HeadCell title='Medlemmer' column='members' tableState={[table, sortColumn]}/>
        </>
      }>
        {table.data.map(team => {

          return <Row key={team.id}>
            <Cell><RouteLink href={`/team/${team.id}`}>{team.name}</RouteLink></Cell>
            <Cell>{intl[team.teamType]}</Cell>
            <Cell>{team.members.length}</Cell>
          </Row>
        })}

      </Table>
    </>
  )
}
