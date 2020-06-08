import React, {useEffect} from "react";
import {getAllTeams} from "../api/teamApi";
import {getAllProductAreas} from "../api";
import {ProductArea, ProductTeam} from "../constants";
import {Cell, HeadCell, Row, Table} from "../components/common/Table";
import RouteLink from "../components/common/RouteLink";
import {intl} from "../util/intl/intl";
import {useTable} from "../util/hooks";
import {RouteComponentProps} from "react-router-dom";
import {PathParams} from "./TeamPage";
import {H3, H4} from "baseui/typography";
import {Block} from "baseui/block";

const TagPage = (props: RouteComponentProps<PathParams>) => {
  const [teamList, setTeamList] = React.useState<ProductTeam[]>([])
  const [productAreaList, setProductAreaList] = React.useState<ProductArea[]>([])
  const [paList, setPaList] = React.useState<Record<string, string>>({})
  const [teamFilter, setTeamFilter] = React.useState<ProductTeam[]>([])
  const [productAreaFilter, setProductAreaFilter] = React.useState<ProductArea[]>([])
  const [tag, setTag] = React.useState(props.match.params.id)

  const [teamsTable, sortTeamColumn] = useTable<ProductTeam, keyof ProductTeam>(teamFilter, {
      useDefaultStringCompare: true,
      initialSortColumn: 'name',
      sorting: {
        members: (a, b) => b.members.length - a.members.length,
        productAreaId: (a, b) => (paList[a.productAreaId] || '').localeCompare(paList[b.productAreaId] || ''),
        tags: (a, b) => b.tags.length - a.tags.length
      }
    }
  )

  const [productAreaTable, sortProductAreaColumn] = useTable<ProductArea, keyof ProductArea>(productAreaFilter, {
      useDefaultStringCompare: true,
      initialSortColumn: 'name',
      sorting: {
        description: (a, b) => (a.description || '').localeCompare(b.description || ''),
        tags: (a, b) => b.tags.length - a.tags.length
      }
    }
  )

  useEffect(() => {
    (async () => {
      setTeamList((await getAllTeams()).content)
      let productAreas = (await getAllProductAreas()).content
      const pas: Record<string, string> = {};
      productAreas.forEach(pa => pas[pa.id] = pa.name)
      setProductAreaList(productAreas)
      setPaList(pas)
    })()
    setTag(props.match.params.id)
  }, [props.match.params])

  useEffect(() => setTeamFilter(teamList.filter(t => t.tags.includes(tag))), [teamList])
  useEffect(() => setProductAreaFilter(productAreaList.filter(pa => pa.tags.includes(tag))), [productAreaList])

  return (
    <>
      <Block marginBottom={"1rem"}>
        <H3>Tagg: {tag}</H3>
      </Block>
      <Block marginBottom={"1rem"}>
        <H4>Teams</H4>
      </Block>
      <Table
        emptyText={'teams'}
        headers={
          <>
            <HeadCell title='Navn' column='name' tableState={[teamsTable, sortTeamColumn]}/>
            <HeadCell title='Område' column='productAreaId' tableState={[teamsTable, sortTeamColumn]}/>
            <HeadCell title='Type' column='teamType' tableState={[teamsTable, sortTeamColumn]}/>
            <HeadCell title='Medlemmer' column='members' tableState={[teamsTable, sortTeamColumn]}/>
            <HeadCell title='Tagg' column='members' tableState={[teamsTable, sortTeamColumn]} $style={{maxWidth: '150px'}}/>
          </>
        }
      >
        {teamsTable.data.map(team =>
          <Row key={team.id}>
            <Cell><RouteLink href={`/team/${team.id}`}>{team.name}</RouteLink></Cell>
            <Cell><RouteLink href={`/productarea/${team.productAreaId}`}>{paList[team.productAreaId]}</RouteLink></Cell>
            <Cell>{intl[team.teamType]}</Cell>
            <Cell>{team.members.length}</Cell>
            <Cell>
              <Block maxWidth={"150px"} display={"flex"} flexWrap={true}>
              {team.tags.map(t => {
                return(<Block><RouteLink href={`/team/${t}`}>{t}</RouteLink>&nbsp;</Block>)
              })}
              </Block>
            </Cell>
          </Row>)}
      </Table>

      <Block marginBottom={"1rem"} marginTop={"1rem"}>
        <H4>Områder</H4>
      </Block>

      <Table
        emptyText={'områder'}
        headers={
          <>
            <HeadCell title='Navn' column='name' tableState={[productAreaTable, sortProductAreaColumn]} $style={{maxWidth: '150px'}}/>
            <HeadCell title='Beskrivelse' column='description' tableState={[productAreaTable, sortProductAreaColumn]}/>
            <HeadCell title='Tagg' column='tags' tableState={[productAreaTable, sortProductAreaColumn]} $style={{maxWidth: '150px'}}/>
          </>
        }
      >
        {productAreaTable.data.map(productArea => {
            return (<Row key={productArea.id}>
              <Cell $style={{maxWidth: '150px'}}><RouteLink href={`/productarea/${productArea.id}`}>{productArea.name}</RouteLink></Cell>
              <Cell>{productArea.description}</Cell>
              <Cell $style={{maxWidth: '150px'}}>
                <Block maxWidth={"150px"} display={"flex"} flexWrap={true}>
                {productArea.tags.map(t => {
                  return(<Block><RouteLink href={`/tag/${t}`}>{t}</RouteLink>&nbsp;</Block>)
                })}
                </Block>
              </Cell>
            </Row>)
          }
        )}
      </Table>
    </>
  )
}

export default TagPage
