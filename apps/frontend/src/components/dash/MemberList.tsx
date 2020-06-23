import React, { useEffect } from "react"
import { Member, ProductArea, ProductTeam, Resource, TeamRole } from '../../constants'
import { getAllProductAreas, getAllTeams } from '../../api'
import { Cell, Row, Table } from '../common/Table'
import { intl } from '../../util/intl/intl'
import { HeadingLarge } from 'baseui/typography'
import RouteLink from '../common/RouteLink'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { Spinner } from '../common/Spinner'
import { Block } from 'baseui/block'
import { MemberExport } from '../Members/MemberExport'
import { rolesToOptions } from '../Members/FormEditMember'
import * as _ from 'lodash'

type MemberExt = Member & Partial<Resource> & {
  team?: ProductTeam
  productArea?: ProductArea
}

const productAreaName = (a: MemberExt, pasMap: Record<string, string>) => a.productArea?.name || (a.team && pasMap[a.team.productAreaId]) || ''

export const MemberListImpl = (props: { role?: TeamRole } & RouteComponentProps) => {
  const {role} = props
  const [loading, setLoading] = React.useState(true)
  const [members, setMembers] = React.useState<MemberExt[]>([])
  const [filtered, setFiltered] = React.useState<MemberExt[]>([])
  const [pasMap, setPasMap] = React.useState<Record<string, string>>({})
  const productAreaId = new URLSearchParams(props.history.location.search).get('productAreaId') || undefined

  useEffect(() => {
    (async () => {
      const fetches: Promise<any>[] = []
      const membersExt: MemberExt[] = []
      fetches.push((async () => {
        membersExt.push(...(await getAllTeams()).content.flatMap(t => t.members.map(m => ({...m.resource, ...m, team: t}))))
      })())
      fetches.push((async () => {
        const pas = await getAllProductAreas()
        const pasMapB: Record<string, string> = {};
        pas.content.forEach(pa => pasMapB[pa.id] = pa.name)
        setPasMap(pasMapB)
        membersExt.push(...pas.content.flatMap(pa => pa.members.map(m => ({...m.resource, ...m, productArea: pa}))))
      })())
      await Promise.all(fetches)
      setMembers(membersExt)
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    let list = members
    if (productAreaId) {
      list = list.filter(m => m.team?.productAreaId === productAreaId || m.productArea?.id === productAreaId)
    }
    if (role) {
      list = list.filter(m => m.roles.indexOf(role) >= 0)
    }
    setFiltered(list)
  }, [members, role])

  return (
    <>
      <HeadingLarge>
        <Block display='flex' justifyContent='space-between'>
          <span>Medlemmer ({filtered.length})</span>
          <MemberExport productAreaId={productAreaId} role={role}/>
        </Block>
      </HeadingLarge>
      {loading && <Spinner size='80px'/>}
      {!loading &&
      <Table emptyText={'teams'} data={filtered}
             config={{
               pageSizes: [10, 20, 50, 100, 500, 1000, 10000],
               defaultPageSize: 100,
               useDefaultStringCompare: true,
               initialSortColumn: 'fullName',
               sorting: {
                 team: (a, b) => (a.team?.name || '').localeCompare(b.team?.name || ''),
                 productArea: (a, b) => productAreaName(a, pasMap).localeCompare(productAreaName(b, pasMap)),
                 roles: (a, b) => (a.roles[0] || '').localeCompare((b.roles[0] || ''))
               },
               filter: {
                 fullName: {type: 'search'},
                 team: {type: 'select', mapping: m => ({id: m.team?.id, label: m.team?.name})},
                 productArea: {
                   type: 'select',
                   options: (ms) => _.uniqBy(ms.map(m => m.productArea?.id || m.team?.productAreaId)
                   .filter(id => !!id)
                   .map(id => ({id: id, label: pasMap[id!]})), pa => pa.id),
                   mapping: m => ({id: m.team?.productAreaId || m.productArea?.id, label: m.productArea?.name})
                 },
                 roles: {
                   type: 'select', options: (ms) => rolesToOptions(_.uniq(ms.flatMap(m => m.roles))),
                   mapping: m => rolesToOptions(m.roles)
                 },
                 description: {type: 'search'},
                 resourceType: {type: 'select', mapping: m => ({id: m.resourceType, label: intl[m.resourceType!]})},
               }
             }}
             headers={[
               {title: '#', $style: {maxWidth: '15px'}},
               {title: 'Navn', column: 'fullName'},
               {title: 'Team', column: 'team'},
               {title: 'Område', column: 'productArea'},
               {title: 'Roller', column: 'roles'},
               {title: 'Annet', column: 'description'},
               {title: 'Type', column: 'resourceType'}
             ]} render={table =>
        table.data.slice(table.pageStart, table.pageEnd).map((member, idx) =>
          <Row key={idx}>
            <Cell $style={{maxWidth: '15px'}}>{(table.page - 1) * table.limit + idx + 1}</Cell>
            <Cell>
              <RouteLink href={`/resource/${member.navIdent}`}>
                {member.fullName}
              </RouteLink>
            </Cell>
            <Cell><RouteLink href={`/team/${member?.team?.id}`}>{member.team?.name}</RouteLink></Cell>
            <Cell>
              {member.productArea && <RouteLink href={`/productArea/${member.productArea.id}`}>{member.productArea.name}</RouteLink>}
              {member.team && <Block $style={{opacity: '.75'}}>{pasMap[member.team.productAreaId]}</Block>}
            </Cell>
            <Cell>{member.roles.map(r => intl[r]).join(', ')}</Cell>
            <Cell>{member.description}</Cell>
            <Cell>{intl[member.resourceType!]}</Cell>
          </Row>)}
      />}
    </>
  )
}

export const MemberList = withRouter(MemberListImpl)
