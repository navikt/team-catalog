import * as React from 'react'
import {ReactNode} from 'react'
import {Label2, Paragraph2, ParagraphSmall} from 'baseui/typography'
import {Block} from 'baseui/block'
import {theme} from '../../util'
import {DotTags} from './DotTag'
import {intl} from "../../util/intl/intl";
import {AddressType, AreaType, ChangeStamp, Cluster, ContactAddress, Location, ProductArea, Resource, TeamType} from '../../constants'
import moment from 'moment'
import {AuditName} from './User'
import RouteLink from './RouteLink'
import {SlackLink} from './SlackLink'
import {TextWithLabel} from "./TextWithLabel";
import {FloorPlan, useFloors} from '../../pages/LocationPage'
import {StatefulTooltip} from 'baseui/tooltip'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faClock} from '@fortawesome/free-solid-svg-icons'
import {Markdown} from './Markdown'
import {StyledLink} from 'baseui/link'
import {slackLink, slackUserLink} from '../../util/config'
import {Spinner} from './Spinner'


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
  description: string
  productArea?: ProductArea
  clusters?: Cluster[]
  areaType?: AreaType
  slackChannel?: string
  contactPersonResource?: Resource
  naisTeams?: string[]
  tags?: string[]
  teamType?: TeamType
  qaTime?: string
  locations?: Location[]
  changeStamp?: ChangeStamp
  contactAddresses?: ContactAddress[]
}

const Metadata = (props: MetadataProps) => {
  const {description, productArea, clusters, areaType, slackChannel, contactPersonResource, naisTeams, qaTime, teamType, changeStamp, tags, locations, contactAddresses} = props

  const showAllFields = () => {
    return !!(naisTeams || qaTime || teamType || slackChannel)
  }

  return (
    <>
      <Block width="100%"><TextWithLabel label="Beskrivelse" text={<Markdown source={description}/>}/></Block>
      <Block display="flex" width='100%'>
        <Block maxWidth='400px' marginRight={theme.sizing.scale800}>
          {productArea && <TextWithLabel label="Område" text={
            <RouteLink href={`/area/${productArea.id}`}>{productArea.name}</RouteLink>
          }/>}
          {!!clusters?.length && <TextWithLabel label="Klynger" text={
            clusters.map((c, i) =>
              <React.Fragment key={c.id + i}>
                <RouteLink href={`/cluster/${c.id}`}>{c.name}</RouteLink>
                {i < clusters.length - 1 && <span>, </span>}
              </React.Fragment>
            )}/>}
          {areaType && <TextWithLabel label='Områdetype' text={intl.getString(areaType + '_AREATYPE_DESCRIPTION')}/>}
          {showAllFields() && (
            <>
              <TextWithLabel label="Slack" text={!slackChannel ? 'Fant ikke slack kanal' : <SlackLink channel={slackChannel}/>}/>
              <TextWithLabel label="Innholdet er kvalitetssikret av teamet"
                             text={qaTime ? <span><FontAwesomeIcon icon={faClock}/> {moment(props.qaTime).format('lll')}</span> : 'Ikke kvalitetssikret'}/>
            </>
          )}
          <BulletPointsList label="Tagg" list={!tags ? [] : tags}/>
        </Block>

        <Block
          display={showAllFields() ? 'block' : 'none'}
          marginTop="0"
          paddingLeft={theme.sizing.scale800}
          $style={{borderLeft: `1px solid ${theme.colors.mono600}`}}
        >
          <TextWithLabel label={"Teamtype"} text={teamType ? intl.getString(teamType) : intl.dataIsMissing}/>
          <BulletPointsList label="Team på NAIS" list={!naisTeams ? [] : naisTeams}/>
          <TextWithLabel label='Kontaktperson' text={contactPersonResource ?
            <RouteLink href={`/resource/${contactPersonResource.navIdent}`}>{contactPersonResource.fullName}</RouteLink>
            : "Ingen fast kontaktperson"}/>
          {contactAddresses && <BulletPointsList label='Kontaktadresser'>
            {contactAddresses?.map((va, i) => <ContactAddressView ca={va} key={i}/>)}
          </BulletPointsList>}
        </Block>
      </Block>

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

const ContactAddressView = ({ca}: {ca: ContactAddress}) => {
  switch (ca.type) {
    case AddressType.SLACK:
      return <Block>Slack: <Loading t={!ca.slackChannel}/> <StyledLink href={slackLink(ca.adresse)}>#{ca.slackChannel?.name || ca.adresse}</StyledLink></Block>
    case AddressType.SLACK_USER:
      return <Block>Slack: <Loading t={!ca.slackUser}/> <StyledLink href={slackUserLink(ca.adresse)}>{ca.slackUser?.name || ca.adresse}</StyledLink></Block>
    default:
      return <Block>Epost: <StyledLink href={`mailto:${ca.adresse}`}>{ca.adresse}</StyledLink></Block>
  }
}

const Loading = ({t}: {t: boolean}) => t ? <Block display='inline-block'><Spinner size='8px'/></Block> : null

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
