import React, { useEffect } from "react"
import { Member, ProductArea, ProductTeam, Resource, TeamRole } from '../../constants'
import { getAllTeams } from '../../api/teamApi'
import { useTable } from '../../util/hooks'
import { Cell, HeadCell, Row, Table } from '../common/Table'
import { intl } from '../../util/intl/intl'
import { HeadingLarge } from 'baseui/typography'
import RouteLink from '../common/RouteLink'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { getAllProductAreas } from '../../api'
import { Spinner } from '../common/Spinner'
import { Block } from 'baseui/block'
import { PLACEMENT, StatefulPopover } from 'baseui/popover'
import { StatefulMenu } from 'baseui/menu'
import { Button, KIND } from 'baseui/button'
import { TriangleDown } from 'baseui/icon'
import { Pagination } from 'baseui/pagination'

type MemberExt = Member & Partial<Resource> & {
  team?: ProductTeam
  productArea?: ProductArea
}

export const MemberListImpl = (props: { role?: TeamRole } & RouteComponentProps) => {
  const {role} = props
  const [loading, setLoading] = React.useState(true)
  const [limit, setLimit] = React.useState(100)
  const [page, setPage] = React.useState(1)
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
      const fetches: Promise<any>[] = []
      const membersExt: MemberExt[] = []
      fetches.push((async () => {
        membersExt.push(...(await getAllTeams()).content.flatMap(t => t.members.map(m => ({...m.resource, ...m, team: t}))))
      })())
      fetches.push((async () => {
        membersExt.push(...((await getAllProductAreas()).content.flatMap(pa => pa.members.map(m => ({...m.resource, ...m, productArea: pa})))))
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
      <HeadingLarge>Medlemmer ({table.data.length})</HeadingLarge>
      {loading && <Spinner size='80px'/>}
      {!loading &&
      <>
        <Table emptyText={'teams'} headers={
          <>
            <HeadCell title='#' $style={{maxWidth: '15px'}}/>
            <HeadCell title='Navn' column='fullName' tableState={[table, sortColumn]}/>
            <HeadCell title='Team' column='team' tableState={[table, sortColumn]}/>
            <HeadCell title='Område' column='productArea' tableState={[table, sortColumn]}/>
            <HeadCell title='Roller' column='roles' tableState={[table, sortColumn]}/>
            <HeadCell title='Annet' column='description' tableState={[table, sortColumn]}/>
            <HeadCell title='Type' column='resourceType' tableState={[table, sortColumn]}/>
          </>
        }>
          {table.data.slice((page - 1) * limit, (page) * limit).map((member, idx) =>
            <Row key={idx}>
              <Cell $style={{maxWidth: '15px'}}>{(page - 1) * limit + idx + 1}</Cell>
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

        <Block display="flex" justifyContent="space-between" marginTop="1rem">
          <StatefulPopover
            content={({close}) => (
              <StatefulMenu
                items={[10, 20, 50, 100].map(i => ({label: i,}))}
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
            <Button kind={KIND.tertiary} endEnhancer={TriangleDown}>{`${limit} ${intl.rows}`}</Button>
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
