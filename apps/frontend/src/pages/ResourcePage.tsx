import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { PathParams } from "./TeamPage";
import { getAllMemberships, getResourceById } from "../api/resourceApi";
import { ProductArea, ProductTeam, Resource } from "../constants";
import { H4 } from "baseui/typography";
import { Block } from "baseui/block";
import { theme } from "../util";
import { TextWithLabel } from "../components/common/TextWithLabel";
import { UserImage } from "../components/common/UserImage";
import CardList from "../components/ProductArea/List";
import moment from 'moment'
import { intl } from '../util/intl/intl'
import { Spinner } from '../components/common/Spinner'

const ResourcePage = (props: RouteComponentProps<PathParams>) => {

  const [resource, setResource] = useState<Resource>()
  const [teams, setTeams] = useState<ProductTeam[]>([])
  const [productAreas, setProductAreas] = useState<ProductArea[]>([])
  const [isLoading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const resourceResponse = await getResourceById(props.match.params.id);
        setResource(resourceResponse)
        const teamsResponse = await getAllMemberships(resourceResponse.navIdent);
        setTeams(teamsResponse.teams)
        setProductAreas(teamsResponse.productAreas)
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
        <H4>{resource?.fullName} {resource?.endDate && moment(resource?.endDate).isBefore(moment()) && '(Inaktiv)'}</H4>
      </Block>
      <Block display="flex" width='100%'>
        <Block width="30%">
          <TextWithLabel label={"Nav-Ident"} text={resource?.navIdent}/>
          <TextWithLabel label={"Type"} text={resource?.resourceType && intl[resource.resourceType]}/>
          <TextWithLabel label={"Epost"} text={resource?.email}/>
          <TextWithLabel label={"Start dato"} text={resource?.startDate && moment(resource.startDate).format('ll')}/>
          {resource?.endDate && <TextWithLabel label={"Slutt dato"} text={moment(resource.endDate).format('ll')}/>}
        </Block>

        <Block
          marginTop="0"
          paddingLeft={theme.sizing.scale800}
        >
          <TextWithLabel label={""} text={resource?.navIdent && (<UserImage ident={resource.navIdent} size={"200px"}/>)}/>
        </Block>
      </Block>
      <Block marginTop="3rem">
        <CardList teams={teams} productAreas={productAreas} resource={resource}/>
      </Block>
    </>) :
    (<>
      <Block>
        <Spinner size='100px'/>
      </Block>
    </>)
}

export default ResourcePage
