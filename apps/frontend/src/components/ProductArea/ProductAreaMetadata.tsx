import { Block } from 'baseui/block'
import { Spinner } from 'baseui/spinner'
import { Label2, Paragraph2, ParagraphSmall } from 'baseui/typography'
import { AreaType, ProductArea, ProductAreaOwnerGroup, Resource } from '../../constants'
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
import { ProductAreaSummary2 } from '../dash/Dashboard'
import { faUserCircle, faUserNinja } from '@fortawesome/free-solid-svg-icons'
import { TextBox } from '../dash/TextBox'

interface ProductAreaMetadataProps {
  productArea: ProductArea
  productAreaMap?: ProductAreaSummary2
  children?: ReactNode
}

function Loading({ t }: { t: boolean }) {
  return t ? (
    <Block display="inline-block">
      <Spinner size="8px" />
    </Block>
  ) : null
}

function BulletPointsList(props: { label: string; baseUrl?: string; list?: string[]; children?: ReactNode[] }) {
  const len = (props.list || props.children || []).length
  return (
    <Block>
      <Label2>{props.label}</Label2>
      <Block>{len > 0 ? <DotTags items={props.list} children={props.children} baseUrl={props.baseUrl} /> : <Paragraph2>{intl.dataIsMissing}</Paragraph2>}</Block>
    </Block>
  )
}

function ProductAreaOwnerResource(props: { resource: Resource }): JSX.Element {
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

function ProductAreaOwners(props: { paOwners?: ProductAreaOwnerGroup }) {
  if (!props.paOwners) return <TextWithLabel label="Produktområde eier" text={'Ingen eier'} />

  const paOwner = props.paOwners.ownerResource
  const paOwnerGroup = props.paOwners.ownerGroupMemberResourceList
  const paOwnerGroupHasMembers = paOwnerGroup.length !== 0

  return (
    <>
      <TextWithLabel label="Produktområde eier" text={paOwner ? <ProductAreaOwnerResource resource={paOwner} /> : 'Ingen eier'} />

      {paOwnerGroupHasMembers && (
        <TextWithLabel
          label="Produktområde eiergruppe"
          text={paOwnerGroup.map((it) => {
            return <ProductAreaOwnerResource resource={it} />
          })}
        />
      )}
    </>
  )
}

function SummaryCards(props: { productAreaId: string; areaSummaryMap: ProductAreaSummary2 }) {
  const queryParam = `?productAreaId=${props.productAreaId}`

  return (
    <Block display="flex" flexWrap width="100%" justifyContent="space-between">
      <Block marginTop={0}>
        <RouteLink href={`/dashboard/members/all${queryParam}`} hideUnderline>
          <TextBox title="Personer" icon={faUserCircle} value={props.areaSummaryMap.uniqueResourcesCount} subtext={`Medlemskap: ${props.areaSummaryMap.membershipCount}`} />
        </RouteLink>
      </Block>
      <Block marginTop={0}>
        <TextBox
          title="Eksterne"
          icon={faUserNinja}
          value={props.areaSummaryMap.uniqueResourcesExternal}
          subtext={`Andel: ${((props.areaSummaryMap.uniqueResourcesExternal * 100) / props.areaSummaryMap.uniqueResourcesCount).toFixed(0)}%`}
        />
      </Block>
    </Block>
  )
}

export default function ProductAreaMetadata(props: ProductAreaMetadataProps) {
  const { description, areaType, slackChannel, changeStamp, tags, paOwnerGroup, id: paId, name: paName } = props.productArea

  const includeOwnerGroupFields = areaType === AreaType.PRODUCT_AREA

  const leftWidth = props.children ? '55%' : '100%'

  return (
    <>
      <Block width="100%" display="flex" justifyContent="space-between">
        <Block width={leftWidth}>
          <Block width="100%">
            <TextWithLabel label="Beskrivelse" text={<Markdown source={description} />} />
          </Block>

          <Block display="flex" width="100%">
            <Block maxWidth="400px" marginRight={theme.sizing.scale800}>
              <TextWithLabel label="Områdetype" text={intl.getString(areaType + '_AREATYPE_DESCRIPTION')} />
              <TextWithLabel label="Slack" text={!slackChannel ? 'Fant ikke slack kanal' : <SlackLink channel={slackChannel} />} />
              <BulletPointsList label="Tagg" list={!tags ? [] : tags} baseUrl={'/tag/'} />
            </Block>

            {includeOwnerGroupFields && (
              <Block display={'block'} marginTop="0" paddingLeft={theme.sizing.scale800} $style={{ borderLeft: `1px solid ${theme.colors.mono600}` }}>
                <ProductAreaOwners paOwners={paOwnerGroup} />
              </Block>
            )}
          </Block>
        </Block>
        {props.children && (
          <Block width="45%" marginLeft={theme.sizing.scale400} maxWidth="415px">
            {props.productAreaMap && <SummaryCards productAreaId={''} areaSummaryMap={props.productAreaMap} />}
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
