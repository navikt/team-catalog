import React, {useEffect, useState} from "react";
import {RouteComponentProps} from "react-router-dom";
import {PathParams} from "./TeamPage";
import {getResourceById} from "../api/resourceApi";
import {ProductTeam, productTeamSort, Resource} from "../constants";
import {Spinner} from "baseui/spinner";
import {Label1} from "baseui/typography";
import {Block} from "baseui/block";
import {theme} from "../util";
import {TextWithLabel} from "../components/common/TextWithLabel";
import {UserImage} from "../components/common/UserImage";
import {getAllTeamsByMemberId} from "../api/teamApi";
import {Cell, HeadCell, Row, Table} from "../components/common/Table";
import {useTable} from "../util/hooks";
import RouteLink from "../components/common/RouteLink";

const getTeamsByResources = (resources:Resource[])=>{
  const promises = resources.map(
    async (resource) => await getAllTeamsByMemberId(resource.navIdent)
  )
  return Promise.all(promises)
}

const ResourceView = (props: RouteComponentProps<PathParams>) => {

  const [resource, setResource] = useState<Resource>()
  const [teams, setTeams] = useState<ProductTeam[]>([])
  const [isLoading, setLoading] = useState<boolean>(false)
  const [productTeamsTable, sortColumn] = useTable<ProductTeam, keyof ProductTeam>(teams, {sorting: productTeamSort, initialSortColumn: 'name'})

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const resourceResponse = await getResourceById(props.match.params.id);
        setResource(resourceResponse)
        const teamsResponse = await getAllTeamsByMemberId(resourceResponse.navIdent);
        console.log(teamsResponse.content)
        setTeams(teamsResponse.content)
        console.log("OK")
      } catch (e) {
        setResource(undefined)
        console.log("Something went wrong")
      }
      setLoading(false)
    })()
  }, [props.match.params.id])

  return !isLoading ?
    (<>
      <Block display={"flex"} width={"100%"}>
        <Label1>{resource?.fullName}</Label1>
      </Block>
        <Block display="flex" width='100%'>
          <Block width="30%">
            <TextWithLabel label={"Nav-Ident"} text={resource?.navIdent}/>
            <TextWithLabel label={"Type"} text={resource?.resourceType}/>
            <TextWithLabel label={"Epost"} text={resource?.email}/>
            <TextWithLabel label={"Start dato"} text={resource?.startDate}/>
          </Block>

          <Block
            marginTop="0"
            paddingLeft={theme.sizing.scale800}
          >
            <TextWithLabel label={""} text={resource?.navIdent && (<UserImage ident={resource.navIdent} maxWidth={"100px"}/>)}/>
          </Block>
        </Block>
      <Block width={"100%"}>
        {teams.length>0 && (
          <Table emptyText={"Ingen"} headers={
            <>
              <HeadCell title={"name"} column={"name"} tableState={[productTeamsTable, sortColumn]}/>
              <HeadCell title={"slackChannel"} column={"slackChannel"} tableState={[productTeamsTable, sortColumn]}/>
            </>
          }>
            {productTeamsTable.data.map((row, index) => (
              <Row key={index}>
                <Cell>
                  <RouteLink href={`/team/${row.id}`}>{row.name}</RouteLink>
                </Cell>
                <Cell>
                  {row.slackChannel}
                </Cell>
              </Row>
            ))}
          </Table>
        )}
      </Block>
    </>) :
    (<>
      <Block>
        <Spinner size={40}/>
      </Block>
    </>)
}

export default ResourceView
