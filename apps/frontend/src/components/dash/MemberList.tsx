import React, {useEffect} from "react"
import {Member, ProductArea, ProductTeam, Resource, TeamRole} from '../../constants'
import {getAllTeams} from '../../api/teamApi'
import {useTable} from '../../util/hooks'
import {Cell, HeadCell, Row, Table} from '../common/Table'
import {intl} from '../../util/intl/intl'
import {HeadingLarge} from 'baseui/typography'
import RouteLink from '../common/RouteLink'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import {getAllProductAreas} from '../../api'

type MemberExt = Member & Partial<Resource> & {
  team?: ProductTeam
  productArea?: ProductArea
}

export const MemberListImpl = (props: { role?: TeamRole } & RouteComponentProps) => {
  const {role} = props
  const [members, setMembers] = React.useState<MemberExt[]>([])
  const [filtered, setFiltered] = React.useState<MemberExt[]>([])
  const productAreaId = new URLSearchParams(props.history.location.search).get('productAreaId')

  const [table, sortColumn] = useTable<MemberExt, keyof MemberExt>(filtered, {
      useDefaultStringCompare: true,
      initialSortColumn: 'fullName',
      sorting: {
        team: (a, b) => (a.team?.name || '').localeCompare(b.team?.name || ''),
        productArea: (a, b) => (a.productArea?.name || '').localeCompare(b.productArea?.name || ''),
      }
    }
  )

  const filter = (list: MemberExt[]) => {
    if (productAreaId) {
      list = list.filter(m => m.team?.productAreaId === productAreaId || m.productArea?.id === productAreaId)
    }
    if (role) {
      list = list.filter(m => m.roles.indexOf(role) >= 0)
    }
    return list
  }

  useEffect(() => {
    (async () => {
      let members: MemberExt[] = []
      const teamRes = await getAllTeams()
      const paRes = await getAllProductAreas()
      if (teamRes.content) {
        members = teamRes.content.flatMap(t => t.members.map(m => ({...m.resource, ...m, team: t})))
      }
      if (paRes.content) {
        members = [...members, ...paRes.content.flatMap(pa => pa.members.map(m => ({...m.resource, ...m, productArea: pa})))]
      }
      setMembers(members)
    })()
  }, [])

  useEffect(() => setFiltered(filter(members)), [members, role])

  return (
    <>
      <HeadingLarge>Medlemmer ({table.data.length})</HeadingLarge>
      <Table emptyText={'teams'} headers={
        <>
          <HeadCell title='Navn' column='fullName' tableState={[table, sortColumn]}/>
          <HeadCell title='Team' column='team' tableState={[table, sortColumn]}/>
          <HeadCell title='Områder' column='productArea' tableState={[table, sortColumn]}/>
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
            <Cell><RouteLink href={`/team/${member?.team?.id}`}>{member.team?.name}</RouteLink></Cell>
            <Cell><RouteLink href={`/productArea/${member?.productArea?.id}`}>{member.productArea?.name}</RouteLink></Cell>
            <Cell>{member.roles.map(r => intl[r]).join(', ')}</Cell>
            <Cell>{member.description}</Cell>
            <Cell>{intl[member.resourceType!]}</Cell>
          </Row>)}
      </Table>
    </>
  )
}

export const MemberList = withRouter(MemberListImpl)
