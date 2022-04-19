import * as React from 'react'
import { Cluster, ProductArea, ProductTeam, Resource } from '../../../constants'
import CardTeam from './CardTeam'
import CardProductArea from './CardProductArea'
import { Block } from 'baseui/block'
import { Label1, Paragraph2 } from 'baseui/typography'
import { theme } from '../../../util'
import { TeamExport } from '../../Team/TeamExport'
import CardCluster from './CardCluster'
import { useLocation } from 'react-router-dom'
import { getAllTeams } from '../../../api'

type ListMembersProps = {
  teams?: ProductTeam[]
  productAreas?: ProductArea[]
  clusters?: Cluster[]
  resource?: Resource
  productAreaId?: string
  clusterId?: string
}

const getAllProductTeams = async () => {
  const allTeams = (await getAllTeams('active')).content

  return allTeams
}

export const CardList = (props: ListMembersProps) => {
  const [teams, setTeams] = React.useState<ProductTeam[]>([])
  const location = useLocation()

  React.useEffect(() => {
    getAllProductTeams().then((teams) => {
      setTeams(teams)
    })
  }, [props.productAreaId])

  return (
    <>
      {props.teams && (
        <Block>
          <Block display="flex" justifyContent="space-between">
            <Label1 marginBottom={theme.sizing.scale800}>Team ({props.teams.length})</Label1>
            {location.pathname.split('/')[1] !== 'resource' && <TeamExport productAreaId={props.productAreaId} clusterId={props.clusterId} />}
          </Block>
          {props.teams.length ? (
            <Block display="flex" flexWrap>
              {props.teams.map((team: ProductTeam) => (
                <CardTeam key={team.id} team={team} resource={props.resource} />
              ))}
            </Block>
          ) : (
            <Paragraph2>Ingen team</Paragraph2>
          )}
        </Block>
      )}

      {props.clusters && (
        <Block marginTop={theme.sizing.scale1200}>
          <Label1 marginBottom={theme.sizing.scale800}>Klynger ({props.clusters.length})</Label1>
          {props.clusters.length ? (
            <Block display="flex" flexWrap>
              {props.clusters?.map((cl) => (
                <CardCluster key={cl.id} cluster={cl} resource={props.resource} teams={teams.filter((t) => t.clusterIds.indexOf(cl.id) >= 0)} />
              ))}
            </Block>
          ) : (
            <Paragraph2>Ingen klynger</Paragraph2>
          )}
        </Block>
      )}

      {props.productAreas && (
        <Block marginTop={theme.sizing.scale1200}>
          <Label1 marginBottom={theme.sizing.scale800}>Områder ({props.productAreas.length})</Label1>
          {props.productAreas.length ? (
            <Block display="flex" flexWrap>
              {props.productAreas?.map((pa: ProductArea) => (
                <CardProductArea key={pa.id} productArea={pa} resource={props.resource} teams={props.teams} />
              ))}
            </Block>
          ) : (
            <Paragraph2>Ingen områder</Paragraph2>
          )}
        </Block>
      )}
    </>
  )
}
