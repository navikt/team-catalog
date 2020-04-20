import * as React from 'react'
import { Label2, Paragraph2 } from 'baseui/typography'
import { Block } from 'baseui/block'
import { theme } from '../../util'
import { DotTags } from './DotTag'
import { intl } from "../../util/intl/intl";

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
      {props.list.length > 0 ? <DotTags items={props.list} /> : <Paragraph2>{intl.dataIsMissing}</Paragraph2>}
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
  const { description, productAreaName, slackChannel, naisTeams, teamLeadQA, teamType } = props

  const showAllFields = () => {
    if (naisTeams || teamLeadQA || teamType || teamLeadQA) return true
    return false
  }

  return (
    <>
      <Block width="50%"><TextWithLabel label="Beskrivelse" text={description} /></Block>
      <Block display="flex">
        <Block width="30%">
          {productAreaName && <TextWithLabel label="Produktområde" text={productAreaName} />}
          {showAllFields() && (
            <React.Fragment>
              <TextWithLabel label="Slack" text={!slackChannel ? 'Fant ikke slack kanal' : slackChannel} />
              <TextWithLabel label="Innholdet er kvalitetssikret av teamleder" text={teamLeadQA ? "Ja" : "Nei"} />
            </React.Fragment>
          )}
        </Block>

        <Block
          display={showAllFields() ? 'block' : 'none'}
          marginTop="0"
          paddingLeft={theme.sizing.scale800}
          $style={{ borderLeft: `1px solid ${theme.colors.mono600}` }}
        >
          <TextWithLabel label={"Teamtype"} text={teamType ? intl.getString(teamType) : intl.dataIsMissing} />
          <NaisTeamsList label="Teams på NAIS" list={!naisTeams ? [] : naisTeams} />
        </Block>
      </Block>
    </>
  )
}

export default Metadata
