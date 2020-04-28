import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { PathParams } from "./TeamPage";
import { getResourceById } from "../api/resourceApi";
import { ProductTeam, Resource } from "../constants";
import { Spinner } from "baseui/spinner";
import { H4, Label1, Paragraph2 } from "baseui/typography";
import { Block } from "baseui/block";
import { theme } from "../util";
import { TextWithLabel } from "../components/common/TextWithLabel";
import { UserImage } from "../components/common/UserImage";
import { getAllTeamsByMemberId } from "../api/teamApi";
import ListTeams from "../components/ProductArea/ListTeams";
import moment from 'moment'
import { intl } from '../util/intl/intl'

const ResourcePage = (props: RouteComponentProps<PathParams>) => {

  const [resource, setResource] = useState<Resource>()
  const [teams, setTeams] = useState<ProductTeam[]>([])
  const [isLoading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const resourceResponse = await getResourceById(props.match.params.id);
        setResource(resourceResponse)
        const teamsResponse = await getAllTeamsByMemberId(resourceResponse.navIdent);
        setTeams(teamsResponse.content)
      } catch (e) {
        setResource(undefined)
        console.log("Something went wrong", e)
      }
      setLoading(false)
    })()
  }, [props.match.params.id])

  return !isLoading ?
    (<>
      <Block display={"flex"} width={"100%"}>
        <H4>{resource?.fullName}</H4>
      </Block>
      <Block display="flex" width='100%'>
        <Block width="30%">
          <TextWithLabel label={"Nav-Ident"} text={resource?.navIdent}/>
          <TextWithLabel label={"Type"} text={resource?.resourceType && intl[resource.resourceType]}/>
          <TextWithLabel label={"Epost"} text={resource?.email}/>
          <TextWithLabel label={"Start dato"} text={resource?.startDate && moment(resource.startDate).format('ll')}/>
        </Block>

        <Block
          marginTop="0"
          paddingLeft={theme.sizing.scale800}
        >
          <TextWithLabel label={""} text={resource?.navIdent && (<UserImage ident={resource.navIdent} maxWidth={"200px"}/>)}/>
        </Block>
      </Block>
      <Block marginTop="3rem">
        <Label1 marginBottom={theme.sizing.scale800}>Teams</Label1>
        {teams.length > 0 ? <ListTeams teams={teams} resource={resource}/> : <Paragraph2>Ingen teams</Paragraph2>}
      </Block>
    </>) :
    (<>
      <Block>
        <Spinner size={40}/>
      </Block>
    </>)
}

export default ResourcePage
