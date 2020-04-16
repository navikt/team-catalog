import * as React from 'react'
import {Label2, Paragraph2} from 'baseui/typography'
import {Block} from 'baseui/block'
import {theme} from '../../util'
import {DotTags} from './DotTag'
import {intl} from "../../util/intl/intl";

const TextWithLabel = (props: { label: string, text: string }) => (
  <Block marginTop={theme.sizing.scale600}>
    <Label2>{props.label}</Label2>
    <Paragraph2>{props.text}</Paragraph2>
  </Block>
)

const NaisTeamsList = (props: { label: string, list: string[] }) => (
  <Block marginTop={theme.sizing.scale600}>
    <Label2>{props.label}</Label2>
    <Block>
      <DotTags items={props.list}/>
    </Block>
  </Block>
)

type MetadataProps = {
  description: string;
  productAreaName?: string;
  slackChannel?: string;
  naisTeams?: string[],
  teamType?: any,
  teamLeadQA?: boolean
}

const Metadata = (props: MetadataProps) => {
  const {description, productAreaName, slackChannel, naisTeams, teamLeadQA, teamType} = props

  return (
    <Block display="flex">
      <Block width="30%">
        {productAreaName && <TextWithLabel label="Produktområde" text={productAreaName}/>}
        <TextWithLabel label="Beskrivelse" text={description}/>
        <TextWithLabel label="Innholdet er kvalitetssikret av teamleder" text={teamLeadQA?"Ja":"Nei"}/>
      </Block>

      <Block display={slackChannel || naisTeams ? 'block' : 'none'} marginTop="0" paddingLeft={theme.sizing.scale800} $style={{borderLeft: `1px solid ${theme.colors.mono600}`}}>
        <TextWithLabel label="Slack" text={!slackChannel ? 'Fant ikke slack kanal' : slackChannel}/>
        {teamType && <TextWithLabel label={"Teamtype"} text={intl.getString(teamType)}/>}
        <NaisTeamsList label="Teams på NAIS" list={!naisTeams ? [] : naisTeams}/>
      </Block>

    </Block>
  )
}

export default Metadata
