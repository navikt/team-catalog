import React, { useEffect } from 'react'
import { ProductTeam, ResourceType, TeamType } from '../../constants'
import { getAllProductAreas, getAllTeams } from '../../api'
import { Cell, Row, Table } from '../common/Table'
import { intl } from '../../util/intl/intl'
import { HeadingLarge } from 'baseui/typography'
import RouteLink from '../common/RouteLink'
import { CustomSpinner } from '../common/Spinner'
import {useLocation} from 'react-router-dom'
import { getAllClusters } from '../../api/clusterApi'
import { Block } from 'baseui/block'

export enum TeamSize {
  EMPTY = '0_1',
  UP_TO_5 = '1_6',
  UP_TO_10 = '6_11',
  UP_TO_20 = '11_21',
  OVER_20 = '21_1000',
}

export enum TeamExt {
  _0p = '0_1',
  UP_TO_25p = '0_26',
  UP_TO_50p = '26_51',
  UP_TO_75p = '51_76',
  UP_TO_100p = '76_101',
}

export const TeamList = (props: { teamType?: TeamType; teamSize?: TeamSize; teamExt?: TeamExt }) => {
  const { teamSize, teamType, teamExt } = props
  const [loading, setLoading] = React.useState(true)
  const [teamList, setTeamList] = React.useState<ProductTeam[]>([])
  const [paList, setPaList] = React.useState<Record<string, string>>({})
  const [clusterMap, setClusterMap] = React.useState<Record<string, string>>({})
  const [filtered, setFiltered] = React.useState<ProductTeam[]>([])
  const location = useLocation()
  const productAreaId = new URLSearchParams(location.search).get('productAreaId')
  const clusterId = new URLSearchParams(location.search).get('clusterId')

  const filter = (list: ProductTeam[]) => {
    if (productAreaId) {
      list = list.filter((t) => t.productAreaId === productAreaId)
    }
    if (clusterId) {
      list = list.filter((t) => t.clusterIds.indexOf(clusterId) >= 0)
    }
    if (teamType) {
      list = list.filter((t) => t.teamType === teamType)
    }
    if (teamSize) {
      const from = parseInt(teamSize.substr(0, teamSize.indexOf('_')))
      const to = parseInt(teamSize.substr(teamSize.indexOf('_') + 1))
      list = list.filter((t) => t.members.length >= from && t.members.length < to)
    }
    if (teamExt) {
      const from = parseInt(teamExt.substr(0, teamExt.indexOf('_')))
      const to = parseInt(teamExt.substr(teamExt.indexOf('_') + 1))
      list = list.filter((t) => {
        const ext = t.members.filter((m) => m.resource.resourceType === ResourceType.EXTERNAL).length
        const extP = t.members.length === 0 ? 0 : (ext * 100) / t.members.length
        return extP >= from && extP < to
      })
    }
    return list
  }

  useEffect(() => {
    ;(async () => {
      const fetches: Promise<any>[] = []
      fetches.push(
        (async () => {
          setTeamList((await getAllTeams('active')).content)
          const pas: Record<string, string> = {}
          ;(await getAllProductAreas('active')).content.forEach((pa) => (pas[pa.id] = pa.name))
          setPaList(pas)
        })()
      )
      fetches.push(
        (async () => {
          const cls = await getAllClusters('active')
          const clusterMapB: Record<string, string> = {}
          cls.content.forEach((cl) => (clusterMapB[cl.id] = cl.name))
          setClusterMap(clusterMapB)
        })()
      )
      await Promise.all(fetches)
      setLoading(false)
    })()
  }, [])

  useEffect(() => setFiltered(filter(teamList)), [teamList, teamSize, teamType])

  return (
    <>
      <HeadingLarge>Teams ({filtered.length})</HeadingLarge>
      {loading && <CustomSpinner size="80px" />}
      {!loading && (
        <Table
          emptyText={'team'}
          data={filtered}
          config={{
            useDefaultStringCompare: true,
            initialSortColumn: 'name',
            sorting: {
              members: (a, b) => b.members.length - a.members.length,
              productAreaId: (a, b) => ((a.productAreaId && paList[a.productAreaId]) || '').localeCompare((b.productAreaId && paList[b.productAreaId]) || ''),
            },
          }}
          headers={[
            { title: 'Navn', column: 'name' },
            { title: 'Område', column: 'productAreaId' },
            { title: 'Klynger', column: 'clusterIds' },
            { title: 'Type', column: 'teamType' },
            { title: 'Medlemmer', column: 'members' },
          ]}
          render={(table) =>
            table.data.map((team) => (
              <Row key={team.id}>
                <Cell>
                  <RouteLink href={`/team/${team.id}`}>{team.name}</RouteLink>
                </Cell>
                <Cell>{team.productAreaId && <RouteLink href={`/area/${team.productAreaId}`}>{paList[team.productAreaId]}</RouteLink>}</Cell>
                <Cell>
                  <Block display="flex" flexDirection="column">
                    {team.clusterIds.map((id, i) => (
                      <Block key={i}>
                        <RouteLink href={`/cluster/${id}`}>{clusterMap[id]}</RouteLink>
                      </Block>
                    ))}
                  </Block>
                </Cell>
                <Cell>{intl[team.teamType]}</Cell>
                <Cell>{team.members.length}</Cell>
              </Row>
            ))
          }
        />
      )}
    </>
  )
}
