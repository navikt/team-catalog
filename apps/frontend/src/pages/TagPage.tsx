import React, {useEffect} from "react";
import {getAllTeams} from "../api/teamApi";
import {getAllProductAreas} from "../api";
import {ProductArea, ProductTeam} from "../constants";
import {Cell, Row, Table} from "../components/common/Table";
import RouteLink from "../components/common/RouteLink";
import {intl} from "../util/intl/intl";
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
        data={teamFilter}
        config={{
          useDefaultStringCompare: true,
          initialSortColumn: 'name',
          sorting: {
            members: (a, b) => b.members.length - a.members.length,
            productAreaId: (a, b) => (paList[a.productAreaId] || '').localeCompare(paList[b.productAreaId] || ''),
            tags: (a, b) => b.tags.length - a.tags.length
          }
        }
        }
        headers={[
          {title: 'Navn', column: 'name'},
          {title: 'Område', column: 'productAreaId'},
          {title: 'Type', column: 'teamType'},
          {title: 'Medlemmer', column: 'members'},
          {title: 'Tagg', column: 'members', $style: {maxWidth: '150px'}}
        ]}

        render={teamsTable => teamsTable.data.map(team =>
          <Row key={team.id}>
            <Cell><RouteLink href={`/team/${team.id}`}>{team.name}</RouteLink></Cell>
            <Cell><RouteLink href={`/productarea/${team.productAreaId}`}>{paList[team.productAreaId]}</RouteLink></Cell>
            <Cell>{intl[team.teamType]}</Cell>
            <Cell>{team.members.length}</Cell>
            <Cell>
              <Block maxWidth={"150px"} display={"flex"} flexWrap={true}>
                {team.tags.map((t,index) => {
                  return (<Block key={index}><RouteLink href={`/tag/${t}`}>{t}</RouteLink>&nbsp;</Block>)
                })}
              </Block>
            </Cell>
          </Row>)}/>

      <Block marginBottom={"1rem"} marginTop={"1rem"}>
        <H4>Områder</H4>
      </Block>

      <Table
        emptyText={'områder'}
        data={productAreaFilter}
        config={{
          useDefaultStringCompare: true,
          initialSortColumn: 'name',
          sorting: {
            description: (a, b) => (a.description || '').localeCompare(b.description || ''),
            tags: (a, b) => b.tags.length - a.tags.length
          }
        }}
        headers={[
          {title: 'Navn', column: 'name', $style: {maxWidth: '150px'}},
          {title: 'Beskrivelse', column: 'description'},
          {title: 'Tagg', column: 'tags', $style: {maxWidth: '150px'}}
        ]}
        render={productAreaTable =>
          productAreaTable.data.map(productArea => {
              return (<Row key={productArea.id}>
                <Cell $style={{maxWidth: '150px'}}><RouteLink href={`/productarea/${productArea.id}`}>{productArea.name}</RouteLink></Cell>
                <Cell>{productArea.description}</Cell>
                <Cell $style={{maxWidth: '150px'}}>
                  <Block maxWidth={"150px"} display={"flex"} flexWrap={true}>
                    {productArea.tags.map((t,index) => {
                      return (<Block key={index}><RouteLink href={`/tag/${t}`}>{t}</RouteLink>&nbsp;</Block>)
                    })}
                  </Block>
                </Cell>
              </Row>)
            }
          )}/>
    </>
  )
}

export default TagPage
