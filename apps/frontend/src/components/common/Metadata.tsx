import * as React from 'react'
import {Label2, Paragraph2, ParagraphSmall} from 'baseui/typography'
import {Block} from 'baseui/block'
import {theme} from '../../util'
import {DotTags} from './DotTag'
import {intl} from "../../util/intl/intl";
import {ChangeStamp} from '../../constants'
import moment from 'moment'
import {AuditName} from './User'
import RouteLink from './RouteLink'
import {SlackLink} from './SlackLink'
import {TextWithLabel} from "./TextWithLabel";
import ReactMarkdown from 'react-markdown'


const BulletPointsList = (props: { label: string, list: string[] }) => (
  <Block>
    <Label2>{props.label}</Label2>
    <Block>
      {props.list.length > 0 ? <DotTags items={props.list}/> : <Paragraph2>{intl.dataIsMissing}</Paragraph2>}
    </Block>
  </Block>
)

type MetadataProps = {
  description: string;
  productAreaId?: string;
  productAreaName?: string;
  slackChannel?: string;
  naisTeams?: string[],
  tags?: string[],
  teamType?: any,
  teamLeadQA?: boolean
  changeStamp?: ChangeStamp
}

const Metadata = (props: MetadataProps) => {
  const {description, productAreaId, productAreaName, slackChannel, naisTeams, teamLeadQA, teamType, changeStamp, tags} = props

  const showAllFields = () => {
    return !!(naisTeams || teamLeadQA || teamType || teamLeadQA);
  }

  return (
    <>
      <Block width="100%"><TextWithLabel label="Beskrivelse" text={
        <ReactMarkdown source={description} linkTarget='_blank'/>
      }/></Block>
      <Block display="flex" width='100%'>
        <Block maxWidth='400px' marginRight={theme.sizing.scale800}>
          {productAreaName && <TextWithLabel label="Område" text={
            productAreaId ? <RouteLink href={`/productarea/${productAreaId}`}>{productAreaName}</RouteLink> : productAreaName
          }/>}
          {showAllFields() && (
            <>
              <TextWithLabel label="Slack" text={!slackChannel ? 'Fant ikke slack kanal' : <SlackLink channel={slackChannel}/>}/>
              <TextWithLabel label="Innholdet er kvalitetssikret av teamet" text={teamLeadQA ? "Ja" : "Nei"}/>
            </>
          )}
        </Block>

        <Block
          display={showAllFields() ? 'block' : 'none'}
          marginTop="0"
          paddingLeft={theme.sizing.scale800}
          $style={{borderLeft: `1px solid ${theme.colors.mono600}`}}
        >
          <TextWithLabel label={"Teamtype"} text={teamType ? intl.getString(teamType) : intl.dataIsMissing}/>
          <BulletPointsList label="Teams på NAIS" list={!naisTeams ? [] : naisTeams}/>
          <BulletPointsList label="Tagger" list={!tags ? [] : tags}/>
        </Block>

      </Block>
      <Block display="flex" justifyContent={"flex-end"}>
        {changeStamp && <Block>
          <ParagraphSmall>
            <i>
              Sist endret av : <AuditName name={changeStamp.lastModifiedBy}/> - {moment(changeStamp?.lastModifiedDate).format('lll')}
            </i>
          </ParagraphSmall>
        </Block>}
      </Block>
    </>
  )
}

export default Metadata
