import React, { useEffect } from "react"
import { Member, ProductTeam, TeamRole } from '../../constants'
import { getAllTeams } from '../../api/teamApi'
import { useTable } from '../../util/hooks'
import { Cell, HeadCell, Row, Table } from '../common/Table'
import { intl } from '../../util/intl/intl'
import { HeadingLarge } from 'baseui/typography'
import RouteLink from '../common/RouteLink'

interface TeamMember extends Member {
  team: ProductTeam
}

export const MemberList = (props: { role: TeamRole }) => {
  const {role} = props
  const [members, setMembers] = React.useState<TeamMember[]>([])
  const [filtered, setFiltered] = React.useState<TeamMember[]>([])

  const [table, sortColumn] = useTable<TeamMember, keyof TeamMember>(filtered, {
      useDefaultStringCompare: true,
      initialSortColumn: 'name',
      sorting: {
        team: (a, b) => a.team.name.localeCompare(b.team.name)
      }
    }
  )
  const filter = (list: TeamMember[]) => {
    if (role) {
      list = list.filter(m => m.roles.indexOf(role) >= 0)
    }
    return list
  }

  useEffect(() => {
    (async () => {
      const res = await getAllTeams()
      if (res.content) {
        setMembers(res.content.flatMap(t => t.members.map(m => ({...m, team: t}))))
      }
    })()
  }, [])

  useEffect(() => setFiltered(filter(members)), [members, role])

  return (
    <>
      <HeadingLarge>Team-medlemmer ({table.data.length})</HeadingLarge>
      <Table emptyText={'teams'} headers={
        <>
          <HeadCell title='Navn' column='name' tableState={[table, sortColumn]}/>
          <HeadCell title='Team' column='team' tableState={[table, sortColumn]}/>
          <HeadCell title='Roller' column='roles' tableState={[table, sortColumn]}/>
          <HeadCell title='Annet' column='description' tableState={[table, sortColumn]}/>
          <HeadCell title='Type' column='resourceType' tableState={[table, sortColumn]}/>
        </>
      }>
        {table.data.map((member, idx) =>
          <Row key={idx}>
            <Cell>
              <RouteLink href={`/resource/${member.navIdent}`}>
                {member.name}
              </RouteLink>
            </Cell>
            <Cell><RouteLink href={`/team/${member.team.id}`}>{member.team.name}</RouteLink></Cell>
            <Cell>{member.roles.map(r => intl[r]).join(', ')}</Cell>
            <Cell>{member.description}</Cell>
            <Cell>{intl[member.resourceType]}</Cell>
          </Row>)}
      </Table>
    </>
  )
}
