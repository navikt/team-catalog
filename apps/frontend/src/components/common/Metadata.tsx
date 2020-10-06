import * as React from 'react'
import {ReactNode} from 'react'
import {Label2, Paragraph2, ParagraphSmall} from 'baseui/typography'
import {Block} from 'baseui/block'
import {theme} from '../../util'
import {DotTags} from './DotTag'
import {intl} from "../../util/intl/intl";
import {AreaType, ChangeStamp, Location, TeamType} from '../../constants'
import moment from 'moment'
import {AuditName} from './User'
import RouteLink from './RouteLink'
import {SlackLink} from './SlackLink'
import {TextWithLabel} from "./TextWithLabel";
import ReactMarkdown from 'react-markdown'
import {FloorPlan, useFloors} from '../../pages/LocationPage'
import {StatefulTooltip} from 'baseui/tooltip'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faClock} from '@fortawesome/free-solid-svg-icons'


const BulletPointsList = (props: {label: string, list?: string[], children?: ReactNode[]}) => {
  const len = (props.list || props.children || []).length
  return (
    <Block>
      <Label2>{props.label}</Label2>
      <Block>
        {len > 0 ? <DotTags items={props.list} children={props.children}/> : <Paragraph2>{intl.dataIsMissing}</Paragraph2>}
      </Block>
    </Block>
  )
}

type MetadataProps = {
  description: string;
  productAreaId?: string;
  productAreaName?: string;
  areaType?: AreaType,
  slackChannel?: string;
  naisTeams?: string[],
  tags?: string[],
  teamType?: TeamType,
  qaTime?: string
  locations?: Location[],
  changeStamp?: ChangeStamp
}

const Metadata = (props: MetadataProps) => {
  const {description, productAreaId, productAreaName, areaType, slackChannel, naisTeams, qaTime, teamType, changeStamp, tags, locations} = props

  const showAllFields = () => {
    return !!(naisTeams || qaTime || teamType || slackChannel)
  }

  const tagsList = <BulletPointsList label="Tagg" list={!tags ? [] : tags}/>

  return (
    <>
      <Block width="100%"><TextWithLabel label="Beskrivelse" text={<ReactMarkdown source={description} linkTarget='_blank'/>}/></Block>
      <Block display="flex" width='100%'>
        <Block maxWidth='400px' marginRight={theme.sizing.scale800}>
          {productAreaName && <TextWithLabel label="Område" text={
            productAreaId ? <RouteLink href={`/productarea/${productAreaId}`}>{productAreaName}</RouteLink> : productAreaName
          }/>}
          {areaType && <TextWithLabel label='Områdetype' text={intl.getString(areaType + '_AREATYPE_DESCRIPTION')}/>}
          {showAllFields() && (
            <>
              <TextWithLabel label="Slack" text={!slackChannel ? 'Fant ikke slack kanal' : <SlackLink channel={slackChannel}/>}/>
              <TextWithLabel label="Innholdet er kvalitetssikret av teamet"
                             text={qaTime ? <span><FontAwesomeIcon icon={faClock}/> {moment(props.qaTime).format('lll')}</span> : 'Ikke kvalitetssikret'}/>
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
          {tagsList}
        </Block>
      </Block>

      {!showAllFields() && tagsList}

      {!!locations?.length && <Locations locations={locations}/>}

      <Block display="flex" flexDirection='row-reverse'>
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

const Locations = (props: {locations: Location[]}) => {
  const locations = props.locations
  const floors = useFloors()
  const locationDescription = (l: Location) => (floors.find(f => f.floorId === l.floorId)?.name || l.floorId) + ": " + l.locationCode
  return (
    <Block>
      <BulletPointsList label={'Lokasjon'}>
        {locations.map((l, i) => <Block key={i} $style={{cursor: 'help'}}>
          <StatefulTooltip overrides={{Inner: {style: {backgroundColor: 'white',}}}} content={() =>
            <Block>
              <FloorPlan
                width={600} floor={floors.find(f => f.floorId === l.floorId)!}
                readonly highlight={l.locationCode} locations={locations}
              />
            </Block>
          }>
            <Block>
              <RouteLink href={`/location/${l.floorId}`}>
                {locationDescription(l)}
              </RouteLink>
            </Block>
          </StatefulTooltip>
        </Block>)}
      </BulletPointsList>
    </Block>
  )
}

export default Metadata
