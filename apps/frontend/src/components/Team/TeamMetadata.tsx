import { Block } from 'baseui/block'
import { Spinner } from 'baseui/spinner'
import { LabelMedium, ParagraphMedium, ParagraphSmall } from 'baseui/typography'
import { Resource, ProductTeam, ProductArea, Cluster, AddressType, ContactAddress, UserInfo, Status } from '../../constants'
import { Markdown } from '../common/Markdown'
import RouteLink from '../common/RouteLink'
import { TextWithLabel } from '../common/TextWithLabel'
import { AuditName } from '../common/User'
import moment from 'moment'
import { theme } from '../../util'
import { ReactNode } from 'react'
import { intl } from '../../util/intl/intl'
import { SlackLink } from '../common/SlackLink'
import { DotTags } from '../common/DotTag'
import { getResourceUnitsById } from '../../api'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-solid-svg-icons'
import { StyledLink } from 'baseui/link'
import { slackLink, slackUserLink } from '../../util/config'
import { WEEKDAYS } from './ModalTeam'

interface TeamMetadataProps {
  team: ProductTeam
  productArea?: ProductArea
  clusters: Cluster[]
  children?: ReactNode
  contactAddresses?: ContactAddress[]
}

function Loading({ t }: { t: boolean }) {
  return t ? (
    <Block display="inline-block">
      <Spinner $size="8px" />
    </Block>
  ) : null
}

function BulletPointsList(props: { label: string; baseUrl?: string; list?: string[]; children?: ReactNode[] }) {
  const len = (props.list || props.children || []).length
  return (
    <Block>
      <LabelMedium>{props.label}</LabelMedium>
      <Block>{len > 0 ? <DotTags items={props.list} children={props.children} baseUrl={props.baseUrl} /> : <ParagraphMedium>{intl.dataIsMissing}</ParagraphMedium>}</Block>
    </Block>
  )
}

function TeamOwnerResource(props: { resource: Resource }): JSX.Element {
  const [departmentInfo, setDepartmentInfo] = React.useState<string>('(loading)')
  const res = props.resource

  React.useEffect(() => {
    getResourceUnitsById(res.navIdent)
      .then((it) => {
        const newTxt: string = it?.units[0]?.parentUnit?.name ?? ''
        setDepartmentInfo('(' + newTxt + ')')
      })
      .catch((err) => {
        console.error(err.message)
        setDepartmentInfo('(fant ikke avdeling)')
      })
  }, [res.navIdent])

  return (
    <Block marginBottom="8px">
      <Block display="inline">
        <RouteLink href={`/resource/${res.navIdent}`}>{res.fullName}</RouteLink>
        <Block marginLeft="10px" display="inline">
          {departmentInfo}
        </Block>
      </Block>
    </Block>
  )
}

function TeamOwner(props: { teamOwner?: Resource }) {
  if (!props.teamOwner) return <TextWithLabel label="Team eier" text={'Ingen eier'} />

  const teamOwner = props.teamOwner

  return (
    <>
      <TextWithLabel label="Teameier" text={teamOwner ? <TeamOwnerResource resource={teamOwner} /> : 'Ingen eier'} />
    </>
  )
}

export const getDisplayDay = (day: string) => {
  switch (day) {
    case 'MONDAY':
      return 'Mandag'
    case 'TUESDAY':
      return 'Tirsdag'
    case 'WEDNESDAY':
      return 'Onsdag'
    case 'THURSDAY':
      return 'Torsdag'
    case 'FRIDAY':
      return 'Fredag'
    default:
      break
  }
}

export default function TeamMetadata(props: TeamMetadataProps) {
  //   const { description, slackChannel, changeStamp, tags, teamOwnerResource, id: paId, name: paName } = props.team
  const { contactPersonResource, naisTeams, qaTime, teamType, changeStamp, tags, teamOwnerResource, locations, location, description, slackChannel, officeHours, status } =
    props.team
  const { productArea, clusters, contactAddresses } = props
  const isPartOfDefaultArea = productArea?.defaultArea || false

  const leftWidth = props.children ? '55%' : '100%'

  const displayOfficeHours = (days: string[], information?: string) => {
    return (
      <Block>
        <ParagraphMedium marginBottom="5px" marginTop="10px">
          {days.length > 0 ? days.map((d) => getDisplayDay(d)).join(', ') : 'Ingen planlagte kontordager'}
        </ParagraphMedium>
        {information && <ParagraphMedium marginTop="0px">{information}</ParagraphMedium>}
      </Block>
    )
  }

  const InactiveStatus = (currentStatus: string) => {
    if (currentStatus === 'INACTIVE') {
      return true
    }
    return false
  }

  return (
    <>
      <Block width="100%" display="flex" justifyContent="space-between">
        <Block width={leftWidth}>
          <Block width="100%">
            <TextWithLabel label="Beskrivelse" text={<Markdown source={description} />} />
          </Block>

          <Block display="flex" width="100%">
            <Block maxWidth="400px" marginRight={theme.sizing.scale800}>
              {productArea && <TextWithLabel label="Område" text={<RouteLink href={`/area/${productArea.id}`}>{productArea.name}</RouteLink>} />}
              {isPartOfDefaultArea && <TeamOwner teamOwner={teamOwnerResource} />}
              {!!clusters?.length && (
                <TextWithLabel
                  label="Klynger"
                  text={clusters.map((c, i) => (
                    <React.Fragment key={c.id + i}>
                      <RouteLink href={`/cluster/${c.id}`}>{c.name}</RouteLink>
                      {i < clusters.length - 1 && <span>, </span>}
                    </React.Fragment>
                  ))}
                />
              )}
              <TextWithLabel label="Slack" text={!slackChannel ? 'Fant ikke slack kanal' : <SlackLink channel={slackChannel} />} />
              <TextWithLabel
                label="Innholdet er kvalitetssikret av teamet"
                text={
                  qaTime ? (
                    <span>
                      <FontAwesomeIcon icon={faClock} />
                      {moment(qaTime).format('lll')}
                    </span>
                  ) : (
                    'Ikke kvalitetssikret'
                  )
                }
              />
              <BulletPointsList label="Tagg" list={!tags ? [] : tags} baseUrl={'/tag/'} />
              <TextWithLabel color={InactiveStatus(status) ? 'red' : 'black'} label="Status" text={intl[status]} />
            </Block>
            <Block display={'block'} marginTop="0" paddingLeft={theme.sizing.scale800} $style={{ borderLeft: `1px solid ${theme.colors.mono600}` }}>
              <TextWithLabel label={'Teamtype'} text={teamType ? intl.getString(teamType) : intl.dataIsMissing} />
              <BulletPointsList label="Team på NAIS" list={!naisTeams ? [] : naisTeams} />
              <TextWithLabel
                label="Kontaktperson"
                text={
                  contactPersonResource ? <RouteLink href={`/resource/${contactPersonResource.navIdent}`}>{contactPersonResource.fullName}</RouteLink> : 'Ingen fast kontaktperson'
                }
              />
              {contactAddresses && (
                <BulletPointsList label="Kontaktadresser">
                  {contactAddresses.map((va, i) => (
                    <ContactAddressView ca={va} key={i} />
                  ))}
                </BulletPointsList>
              )}
              {officeHours && (
                <>
                  <TextWithLabel label={'Lokasjon'} text={<RouteLink href={`/location/${officeHours.location.code}`}>{officeHours.location.displayName}</RouteLink>} />
                  {officeHours.days && (
                    <>
                      <TextWithLabel label={'Planlagte kontordager'} text={displayOfficeHours(officeHours.days, officeHours.information)} />
                    </>
                  )}
                </>
              )}
            </Block>
          </Block>
        </Block>
        {props.children && (
          <Block width="45%" marginLeft={theme.sizing.scale400} maxWidth="415px">
            {props.children}
          </Block>
        )}
      </Block>
      <Block display="flex" flexDirection="row-reverse">
        {changeStamp && (
          <Block>
            <ParagraphSmall>
              <i>
                Sist endret av : <AuditName name={changeStamp.lastModifiedBy} /> - {moment(changeStamp?.lastModifiedDate).format('lll')}
              </i>
            </ParagraphSmall>
          </Block>
        )}
      </Block>
    </>
  )
}

const ContactAddressView = ({ ca }: { ca: ContactAddress }) => {
  switch (ca.type) {
    case AddressType.SLACK:
      return (
        <Block>
          Slack: <Loading t={!ca.slackChannel} /> <StyledLink href={slackLink(ca.address)}>#{ca.slackChannel?.name || ca.address}</StyledLink>
        </Block>
      )
    case AddressType.SLACK_USER:
      return (
        <Block>
          Slack: <Loading t={!ca.slackUser} /> <StyledLink href={slackUserLink(ca.address)}>{ca.slackUser?.name || ca.address}</StyledLink>
        </Block>
      )
    default:
      return (
        <Block>
          Epost: <StyledLink href={`mailto:${ca.address}`}>{ca.address}</StyledLink>
        </Block>
      )
  }
}
