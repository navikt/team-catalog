import React, { useEffect } from "react"
import { ProductTeam, Resource, TeamMember, TeamRole } from '../../constants'
import { getAllTeams } from '../../api/teamApi'
import { useTable } from '../../util/hooks'
import { Cell, HeadCell, Row, Table } from '../common/Table'
import { intl } from '../../util/intl/intl'
import { HeadingLarge } from 'baseui/typography'
import RouteLink from '../common/RouteLink'
import { RouteComponentProps, withRouter } from 'react-router-dom'

interface TeamMemberExt extends TeamMember, Partial<Omit<Resource, 'navIdent'>> {
  team: ProductTeam
}

export const MemberListImpl = (props: { role: TeamRole } & RouteComponentProps) => {
  const {role} = props
  const [members, setMembers] = React.useState<TeamMemberExt[]>([])
  const [filtered, setFiltered] = React.useState<TeamMemberExt[]>([])
  const productAreaId = new URLSearchParams(props.history.location.search).get('productAreaId')

  const [table, sortColumn] = useTable<TeamMemberExt, keyof TeamMemberExt>(filtered, {
      useDefaultStringCompare: true,
      initialSortColumn: 'fullName',
      sorting: {
        team: (a, b) => a.team.name.localeCompare(b.team.name)
      }
    }
  )
  const filter = (list: TeamMemberExt[]) => {
    if (productAreaId) {
      list = list.filter(m => m.team.productAreaId === productAreaId)
    }
    if (role) {
      list = list.filter(m => m.roles.indexOf(role) >= 0)
    }
    return list
  }

  useEffect(() => {
    (async () => {
      const res = await getAllTeams()
      if (res.content) {
        setMembers(res.content.flatMap(t => t.members.map(m => ({...m.resource, ...m, team: t}))))
      }
    })()
  }, [])

  useEffect(() => setFiltered(filter(members)), [members, role])

  return (
    <>
      <HeadingLarge>Team-medlemmer ({table.data.length})</HeadingLarge>
      <Table emptyText={'teams'} headers={
        <>
          <HeadCell title='Navn' column='fullName' tableState={[table, sortColumn]}/>
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
                {member.fullName}
              </RouteLink>
            </Cell>
            <Cell><RouteLink href={`/team/${member.team.id}`}>{member.team.name}</RouteLink></Cell>
            <Cell>{member.roles.map(r => intl[r]).join(', ')}</Cell>
            <Cell>{member.description}</Cell>
            <Cell>{intl[member.resourceType!]}</Cell>
          </Row>)}
      </Table>
    </>
  )
}

export const MemberList = withRouter(MemberListImpl)
