import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {PathParams} from "./TeamPage";
import {getAllMemberships, getResourceById, getResourceUnitsById, Membership} from "../api";
import {Resource, ResourceType, ResourceUnits} from "../constants";
import {H4} from "baseui/typography";
import {Block} from "baseui/block";
import {theme} from "../util";
import {TextWithLabel} from "../components/common/TextWithLabel";
import {UserImage} from "../components/common/UserImage";
import {CardList} from "../components/ProductArea/List";
import moment from 'moment'
import {intl} from '../util/intl/intl'
import {Spinner} from '../components/common/Spinner'
import {ObjectLink} from '../components/common/RouteLink'
import {ObjectType} from '../components/admin/audit/AuditTypes'

const ResourcePage = () => {
  const params = useParams<PathParams>()
  const [resource, setResource] = useState<Resource>()
  const [unit, setUnits] = useState<ResourceUnits>()
  const [memberships, setMemberships] = useState<Membership>({clusters: [], productAreas: [], teams: []})
  const [isLoading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const resource = await getResourceById(params.id)
        setResource(resource)
        setMemberships(await getAllMemberships(resource.navIdent))
      } catch (e) {
        setResource(undefined)
        console.log("Something went wrong", e)
      }
      getResourceUnitsById(params.id).then(setUnits).catch(e => console.debug(`cant find units for ${params.id}`))
      setLoading(false)
    })()
  }, [params.id])

  return !isLoading ?
    (<>
      <Block display={"flex"} width={"100%"}>
        <H4>{resource?.fullName} {resource?.endDate && moment(resource?.endDate).isBefore(moment()) && '(Inaktiv)'} {resource?.resourceType === ResourceType.OTHER && `(${intl.nonNavEmployee})`}</H4>
      </Block>
      <Block display="flex" width='100%'>
        <Block width="30%">
          <TextWithLabel label={"Nav-Ident"} text={resource?.navIdent}/>
          <TextWithLabel label={"Type"} text={resource?.resourceType && intl[resource.resourceType]}/>
          <TextWithLabel label={"Epost"} text={resource?.email}/>
          <TextWithLabel label={"Start dato"} text={resource?.startDate && moment(resource.startDate).format('ll')}/>
          {resource?.endDate && <TextWithLabel label={"Slutt dato"} text={moment(resource.endDate).format('ll')}/>}
          {unit && unit.units.map((u, i) =>
            <TextWithLabel key={i} label={`Tilhørighet ${(unit.units.length > 1) ? `(${i + 1})` : ''}`} text={
              <Block>
                <Block>Ansatt: {u.name}</Block>
                {u.parentUnit && <Block>Avdeling: {u.parentUnit.name}</Block>}
                {u.leader && <Block>Leder: <ObjectLink type={ObjectType.Resource} id={u.leader.navIdent}>{u.leader.fullName}</ObjectLink></Block>}
              </Block>
            }/>
          )}
        </Block>

        <Block
          marginTop="0"
          paddingLeft={theme.sizing.scale800}
        >
          <TextWithLabel label={""} text={resource?.navIdent && (<UserImage ident={resource.navIdent} size={"200px"}/>)}/>
        </Block>
      </Block>
      <Block marginTop="3rem">
        <CardList teams={memberships.teams} productAreas={memberships.productAreas} clusters={memberships.clusters} resource={resource}/>
      </Block>
    </>) :
    (<>
      <Block>
        <Spinner size='100px'/>
      </Block>
    </>)
}

export default ResourcePage
