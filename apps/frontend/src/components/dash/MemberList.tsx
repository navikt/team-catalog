import React, {useEffect} from "react"
import {Cluster, Member, ProductArea, ProductTeam, Resource, ResourceUnits, TeamRole} from '../../constants'
import {getAllProductAreas, getAllTeams, getResourceUnitsById} from '../../api'
import {Cell, Row, Table} from '../common/Table'
import {intl} from '../../util/intl/intl'
import {HeadingLarge} from 'baseui/typography'
import RouteLink from '../common/RouteLink'
import {Spinner} from '../common/Spinner'
import {Block} from 'baseui/block'
import {MemberExport} from '../Members/MemberExport'
import {rolesToOptions} from '../Members/FormEditMember'
import * as _ from 'lodash'
import {useQueryParam} from '../../util/hooks'
import {getAllClusters} from '../../api/clusterApi'

type MemberExt = Member & Partial<Resource> & {
  team?: ProductTeam
  productArea?: ProductArea
  cluster?: Cluster
}

const productAreaName = (a: MemberExt, pasMap: Record<string, string>) => a.productArea?.name || (a.team?.productAreaId && pasMap[a.team.productAreaId]) || ''

export const MemberList = (props: {role?: TeamRole, leaderIdent?: string}) => {
  const {role, leaderIdent} = props
  const [loading, setLoading] = React.useState(true)
  const [members, setMembers] = React.useState<MemberExt[]>([])
  const [filtered, setFiltered] = React.useState<MemberExt[]>([])
  const [pasMap, setPasMap] = React.useState<Record<string, string>>({})
  const [clusterMap, setClusterMap] = React.useState<Record<string, string>>({})
  const [leader, setLeader] = React.useState<(MemberExt & ResourceUnits) | undefined>()
  const productAreaId = useQueryParam('productAreaId')
  const clusterId = useQueryParam('clusterId')

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
      fetches.push((async () => {
        const cls = await getAllClusters()
        const clusterMapB: Record<string, string> = {};
        cls.content.forEach(cl => clusterMapB[cl.id] = cl.name)
        setClusterMap(clusterMapB)
        membersExt.push(...cls.content.flatMap(cl => cl.members.map(m => ({...m.resource, ...m, cluster: cl}))))
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
    if (clusterId) {
      list = list.filter(m => (m.team?.clusterIds || []).indexOf(clusterId) >= 0)
    }
    if (role) {
      list = list.filter(m => m.roles.indexOf(role) >= 0)
    }
    if (leader) {
      list = list.filter(m => leader.members.find(r => r.navIdent === m.navIdent))
    }
    setFiltered(list)
  }, [members, role, leader])

  useEffect(() => {
    if (!leaderIdent || !members.length) {
      console.log(`pre ${leaderIdent} ${members.length}`)
      setLeader(undefined)
      return
    }
    const leaderObject = members.find(mem => mem.navIdent === leaderIdent)
    console.log(`post ${leaderObject}`)
    if (!leaderObject) return
    getResourceUnitsById(leaderIdent).then(r => {
      console.log(`pang ${r}`)
      setLeader({...leaderObject, ...r})
    }).catch(e => console.debug(`cant find units for ${leaderIdent}`))
  }, [members, leaderIdent])

  return (
    <>
      <HeadingLarge>
        <Block display='flex' justifyContent='space-between'>
          <span>Medlemmer {role ? ` - Rolle: ${intl[role]}` : ''} {leaderIdent ? ` - Leder: ${leader?.fullName || leaderIdent}` : ''} {productAreaId ? ` - Område: ${pasMap[productAreaId]}` : ''} {clusterId ? ` - Klynge: ${clusterMap[clusterId]}` : ''} ({filtered.length})</span>
          <MemberExport productAreaId={productAreaId} role={role}/>
        </Block>
      </HeadingLarge>
      {loading && <Spinner size='80px'/>}
      {!loading &&
      <Table emptyText={'team'} data={filtered}
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
               {title: 'Klynger', column: 'cluster'},
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
              {member.team?.productAreaId && <Block $style={{opacity: '.75'}}>{pasMap[member.team.productAreaId]}</Block>}
            </Cell>
            <Cell>
              {member.cluster && <RouteLink href={`/cluster/${member.cluster.id}`}>{member.cluster.name}</RouteLink>}
              {member.team && <Block $style={{opacity: '.75'}}>{member.team.clusterIds.map(id => clusterMap[id]).join(", ")}</Block>}
            </Cell>
            <Cell>{member.roles.map(r => intl[r]).join(', ')}</Cell>
            <Cell>{member.description}</Cell>
            <Cell>{intl[member.resourceType!]}</Cell>
          </Row>)}
      />}
    </>
  )
}
