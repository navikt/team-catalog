import * as React from 'react'
import {Block} from "baseui/block";
import {useState} from "react";
import {useOrg} from "../api/OrgApi";
import {Redirect, useHistory, useParams} from "react-router-dom";
import PageTitle from "../components/common/PageTitle";
import {TextWithLabel} from "../components/common/TextWithLabel";
import moment from "moment";
import {H1} from "baseui/typography";
import {Card} from "baseui/card";
import RouteLink from "../components/common/RouteLink";
import {cardShadow} from "../components/common/Style";
import {marginAll} from "../components/Style";
import {theme} from "../util";


type PathParams = { id: string }

interface OrgEnhet {
  agressoId: string
  navn: string
  gyldigFom?: string
  gyldigTom?: string
  organiseringer: OrgEnhetOrganisering[]
}

interface OrgEnhetOrganisering {
  retning: "over" | "under"
  organisasjonsenhet: OrgEnhet
}

const OrgEnhetCard = (props: { navn: string, id: string }) => {
  // <RouteLink href={'/tree'}><Button icon={faProjectDiagram} kind='tertiary' size='compact' marginRight>Team graf</Button></RouteLink>
  const ue = props
  const linkUri = "/org/" + ue.id
  return <Card key={ue.id} overrides={{
    Root:
      {
        style:
          {
            ...cardShadow.Root.style,
            width: '450px',
            ...marginAll(theme.sizing.scale200),
          }
      }
  }}><H1>{ue.navn}</H1>
    <RouteLink href={linkUri}>Gå til enhet</RouteLink>
  </Card>
}

const OrgHierarki = ({...overenheter}) => {
  return <TextWithLabel label={"NAV hierarki:"} text={<RouteLink href={overenheter[0].id}>{overenheter[0].navn}</RouteLink>}/>
}

export const OrgMainPage = () => {
  const {id: orgId} = useParams<any>()
  const org:OrgEnhet = useOrg(orgId);
  if(orgId === undefined){
    return <Redirect to={"/org/NAV"}></Redirect>
  }
  if(!org){
    return<div>Laster</div>
  }

  const oe = org
  console.log("her er oe")
  console.log(oe)
  // const underenheter: any = oe.organiseringer
  // // console.log(underenheter)

  const underenheter: { navn: string, id: string }[] = oe.organiseringer.filter(oee => oee.retning === "under").map(ue => {
    // console.log(ue)
    return {navn: ue.organisasjonsenhet.navn, id: ue.organisasjonsenhet.agressoId}
  })

  const overenheter: { navn: string, id: string }[] = oe.organiseringer.filter(oee => oee.retning === "over").map(ue => {
    return {navn: ue.organisasjonsenhet.navn, id: ue.organisasjonsenhet.agressoId}
  })

  const ingenOverenhet = overenheter.length === 0

  return (
    <Block>
      <PageTitle title={oe.navn}/>
      {ingenOverenhet ? null : <OrgHierarki { ...overenheter} /> }
      <Block display="flex" flexWrap>
        {underenheter.map(ue =>
          <OrgEnhetCard navn={ue.navn} id={ue.id}/>
        )}
      </Block>
    </Block>
  )
}
