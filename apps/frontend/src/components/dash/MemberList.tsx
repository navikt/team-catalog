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
import { PLACEMENT, StatefulPopover } from 'baseui/popover'
import { StatefulMenu } from 'baseui/menu'
import { KIND } from 'baseui/button'
import { Pagination } from 'baseui/pagination'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import Button from '../common/Button'
import { MemberExport } from '../Members/MemberExport'

type MemberExt = Member & Partial<Resource> & {
  team?: ProductTeam
  productArea?: ProductArea
}

const productAreaName = (a: MemberExt, pasMap: Record<string, string>) => a.productArea?.name || (a.team && pasMap[a.team.productAreaId]) || ''

export const MemberListImpl = (props: { role?: TeamRole } & RouteComponentProps) => {
  const {role} = props
  const [loading, setLoading] = React.useState(true)
  const [limit, setLimit] = React.useState(100)
  const [page, setPage] = React.useState(1)
  const [members, setMembers] = React.useState<MemberExt[]>([])
  const [filtered, setFiltered] = React.useState<MemberExt[]>([])
  const [pasMap, setPasMap] = React.useState<Record<string, string>>({})
  const productAreaId = new URLSearchParams(props.history.location.search).get('productAreaId') || undefined

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

  useEffect(() => setFiltered(filter(members)), [members, role])

  const numPages = Math.ceil(members.length / limit)
  useEffect(() => {
    if (page > numPages && !loading) {
      setPage(numPages)
    }
  }, [limit, numPages])

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1) {
      return
    }
    if (nextPage > numPages) {
      return
    }
    setPage(nextPage)
  }

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
      <>
        <Table emptyText={'teams'} data={filtered}
               config={{
                 useDefaultStringCompare: true,
                 initialSortColumn: 'fullName',
                 sorting: {
                   team: (a, b) => (a.team?.name || '').localeCompare(b.team?.name || ''),
                   productArea: (a, b) => productAreaName(a, pasMap).localeCompare(productAreaName(b, pasMap)),
                   roles: (a, b) => (a.roles[0] || '').localeCompare((b.roles[0] || ''))
                 },
                 filter: {
                   fullName: true,
                   resourceType: m => ({id: m.resourceType, label: intl[m.resourceType!]}),
                   team: m => ({id: m.team?.id, label: m.team?.name}),
                   productArea: m => ({id: m.productArea?.id, label: m.productArea?.name})
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
          table.data.slice((page - 1) * limit, (page) * limit).map((member, idx) =>
            <Row key={idx}>
              <Cell $style={{maxWidth: '15px'}}>{(page - 1) * limit + idx + 1}</Cell>
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
        />

        <Block display="flex" justifyContent="space-between" marginTop="1rem">
          <StatefulPopover
            content={({close}) => (
              <StatefulMenu
                items={[10, 20, 50, 100, 500, 1000, 10000].map(i => ({label: i,}))}
                onItemSelect={({item}) => {
                  setLimit(item.label)
                  close()
                }}
                overrides={{
                  List: {
                    style: {height: '150px', width: '100px'},
                  },
                }}
              />
            )}
            placement={PLACEMENT.bottom}
          >
            <Block>
              <Button kind={KIND.tertiary} iconEnd={faChevronDown}>{`${limit} ${intl.rows}`}</Button>
            </Block>
          </StatefulPopover>
          <Pagination
            currentPage={page}
            numPages={numPages}
            onPageChange={({nextPage}) => handlePageChange(nextPage)}
            labels={{nextButton: intl.nextButton, preposition: 'av', prevButton: intl.prevButton}}
          />
        </Block>
      </>}
    </>
  )
}

export const MemberList = withRouter(MemberListImpl)
