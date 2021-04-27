import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {PathParams} from "./TeamPage";
import {getAllMemberships, getResourceById, getResourceUnitsById, Membership, useAllProductAreas, useAllTeams} from "../api";
import {Resource, ResourceType, ResourceUnits, TeamRole} from "../constants";
import {H4, HeadingSmall, HeadingXSmall, ParagraphSmall} from "baseui/typography";
import {Block} from "baseui/block";
import {theme} from "../util";
import {TextWithLabel} from "../components/common/TextWithLabel";
import {UserImage} from "../components/common/UserImage";
import {CardList} from "../components/ProductArea/List";
import moment from 'moment'
import {intl} from '../util/intl/intl'
import {Spinner} from '../components/common/Spinner'
import RouteLink, {ObjectLink} from '../components/common/RouteLink'
import {ObjectType} from '../components/admin/audit/AuditTypes'
import {Tab, Tabs} from 'baseui/tabs-motion'
import {useAllClusters} from '../api/clusterApi'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTable} from '@fortawesome/free-solid-svg-icons'

const ResourcePage = () => {
  const params = useParams<PathParams>()
  const [resource, setResource] = useState<Resource>()
  const [unit, setUnits] = useState<ResourceUnits>()
  const [memberships, setMemberships] = useState<Membership>({clusters: [], productAreas: [], teams: []})
  const [isLoading, setLoading] = useState<boolean>(false)
  const [tab, setTab] = useState(0)

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
        </Block>

        <Block
          marginTop="0"
          paddingLeft={theme.sizing.scale800}
        >
          <TextWithLabel label={""} text={resource?.navIdent && (<UserImage ident={resource.navIdent} size={"200px"}/>)}/>
        </Block>
      </Block>
      <Block>
        <Tabs activeKey={tab} onChange={p => setTab(p.activeKey as number)} fill={'fixed'}>
          <Tab title={<HeadingSmall marginBottom={0}>Knytning til team og områder</HeadingSmall>}>
            <Block marginTop="2rem">
              <CardList teams={memberships.teams} productAreas={memberships.productAreas} clusters={memberships.clusters} resource={resource}/>
            </Block>
          </Tab>
          <Tab title={<HeadingSmall marginBottom={0}>Formell organisering</HeadingSmall>}>
            <Block marginTop="2rem">
              {resource && unit && <Units resource={resource} units={unit}/>}
              {!unit?.units.length && <ParagraphSmall>Ingen informasjon</ParagraphSmall>}
            </Block>
          </Tab>
        </Tabs>
      </Block>
    </>) :
    <Spinner size='100px'/>
}

const Units = (props: {resource: Resource, units: ResourceUnits}) => {
  const {units, members} = props.units
  const resource = props.resource

  const teams = useAllTeams()
  const areas = useAllProductAreas()
  const clusters = useAllClusters()

  return (
    <Block display='flex' flexDirection={'column'}>
      <Block>
        {units.map((u, i) =>
          <Block key={resource.navIdent + i} display={'flex'} flexWrap>
            <TextWithLabel label={'Ansatt i'} text={u.name} minWidth={'350px'}/>
            {u.parentUnit && <TextWithLabel label={'Avdeling'} text={u.parentUnit.name} minWidth={'350px'}/>}
            {u.leader && <TextWithLabel label={'Leder'} text={<ObjectLink type={ObjectType.Resource} id={u.leader.navIdent}>{u.leader.fullName}</ObjectLink>}/>}
          </Block>
        )}
      </Block>

      {!!members.length && <Block>
        <HeadingXSmall>
          {resource.fullName} er personalleder for
          <RouteLink href={`/dashboard/members/leader/${resource.navIdent}`} $style={{marginLeft: theme.sizing.scale800}}>
            <span><FontAwesomeIcon icon={faTable}/></span>
          </RouteLink>
        </HeadingXSmall>
        <Block display={'flex'} flexDirection={'column'}>
          {members.sort((a, b) => a.fullName.localeCompare(b.fullName))
          .map((m, i) =>
            <Block display={'flex'} marginBottom={theme.sizing.scale400} paddingBottom={theme.sizing.scale400}
                   key={m.navIdent} $style={{borderBottom: '1px solid #DDD'}}>

              <ResourceHead resource={m}/>

              <Block display={'flex'} flexDirection={'column'} marginTop={theme.sizing.scale400}>
                <WorkConnections ident={m.navIdent} type={ObjectType.Team} items={teams}/>
                <WorkConnections ident={m.navIdent} type={ObjectType.ProductArea} items={areas}/>
                <WorkConnections ident={m.navIdent} type={ObjectType.Cluster} items={clusters}/>
              </Block>
            </Block>
          )}
        </Block>
      </Block>}
    </Block>
  )
}

const ResourceHead = (props: {resource: Resource}) => {
  const m = props.resource
  const [hover, setHover] = useState(false)
  return <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
    <ObjectLink id={m.navIdent} type={ObjectType.Resource} hideUnderline>
      <Block display={'flex'} flexDirection={'column'} alignItems={'center'}
             width={theme.sizing.scale4800} marginRight={theme.sizing.scale600}>
        <UserImage ident={m.navIdent} size={'60px'} disableRefresh border={hover}/>
        <ParagraphSmall marginTop={theme.sizing.scale100} marginBottom={0}
                        $style={{
                          textDecoration: hover ? 'underline' : undefined,
                          wordBreak: 'break-word',
                          textAlign: 'center'
                        }}
        >{m.fullName}</ParagraphSmall>
      </Block>
    </ObjectLink>
  </div>
}

const WorkConnections = (props: {ident: string, type: ObjectType, items: {id: string, name: string, members: {navIdent: string, roles: TeamRole[]}[]}[]}) => {
  const connections = props.items.map(t => ({id: t.id, name: t.name, roles: t.members.find(tm => tm.navIdent === props.ident)?.roles}))
  .filter(t => !!t.roles?.length)

  if (!connections.length) {
    return null
  }

  return <>
    {connections.map((t, i) =>
      <ParagraphSmall marginTop={0} marginBottom={theme.sizing.scale100} key={i}>
        <ObjectLink id={t.id} type={props.type}>{t.name}</ObjectLink> - {t.roles!.map(r => intl[r])}
      </ParagraphSmall>)}
  </>
}

export default ResourcePage
