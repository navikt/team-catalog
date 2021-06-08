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
import {array} from "yup";


type PathParams = { id: string }

export interface OrgEnhet {
  agressoId: string
  navn: string
  gyldigFom?: string
  gyldigTom?: string
  organiseringer: OrgEnhetOrganisering[]
}

export interface OrgEnhetOrganisering {
  retning: "over" | "under"
  organisasjonsenhet: OrgEnhet
}

export interface HierarkiData {
  navn: string,
  id: string
}


const OrgEnhetCard = (props: { navn: string, id: string }) => {
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

const OrgHierarki2 = ({...overenheter}) => {
  return <TextWithLabel label={"NAV hierarki:"} text={<RouteLink href={overenheter[0].id}>{overenheter[0].navn}</RouteLink>}/>
}


const OrgHierarki = (props: { navn: string, id: string }) => {
  const hierarkiData = props
  // return <TextWithLabel label={"NAV hierarki:"} text={<RouteLink href={hierarkiData.id}>{hierarkiData.navn}</RouteLink>}/>
  return <div>
    <RouteLink href={hierarkiData.id}>{hierarkiData.navn}</RouteLink>
  </div>


}

export const OrgMainPage = () => {
  const {id: orgId} = useParams<any>()
  const [org, orgHierarki] = useOrg(orgId);

  // const hierarki: Array<hierarkiData> = orgHierarki
  console.log({orgHierarki: orgHierarki})


  // const org:OrgEnhet = tempOrg
  if(orgId === undefined){
    return <Redirect to={"/org/NAV"}></Redirect>
  }
  if(!org){
    return<div>Laster</div>
  }

  const oe:OrgEnhet = org as OrgEnhet
  // console.log("her er oe")
  // console.log(oe)
  // const underenheter: any = oe.organiseringer
  // // console.log(underenheter)

  const underenheter: { navn: string, id: string }[] = oe.organiseringer.filter(oee => oee.retning === "under").map(ue => {
    // console.log(ue)
    return {navn: ue.organisasjonsenhet.navn, id: ue.organisasjonsenhet.agressoId}
  })

  const overenheter: { navn: string, id: string }[] = oe.organiseringer.filter(oee => oee.retning === "over").map(ue => {
    return {navn: ue.organisasjonsenhet.navn, id: ue.organisasjonsenhet.agressoId}
  })
  // WIP
  // const underenheter2 = Array.from(new Set(underenheter))
  // console.log({underenheter:underenheter})
  // console.log({underenheter2: underenheter2})

  const ingenOverenhet = overenheter.length === 0



  return (
    <Block>
      <PageTitle title={oe.navn}/>
      {/*{ingenOverenhet ? null :*/}
      {/*  <Block>*/}
      {/*    <TextWithLabel label={"NAV hierarki:"} text={hierarki.map(hierarkiData =>*/}
      {/*      <OrgHierarki key={hierarkiData.id} navn={hierarkiData.navn} id={hierarkiData.id}/>*/}
      {/*    )}/>*/}

      {/*  </Block> }*/}

      <Block display="flex" flexWrap>
        {underenheter.map(ue =>
          <OrgEnhetCard key={ue.id} navn={ue.navn} id={ue.id}/>
        )}
      </Block>
    </Block>
  )
}
