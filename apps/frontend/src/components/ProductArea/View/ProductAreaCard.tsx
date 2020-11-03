import * as React from 'react'
import {useState} from 'react'
import {Card, CardOverrides} from 'baseui/card'
import {Block} from 'baseui/block';
import {AreaType} from '../../../constants';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronRight} from '@fortawesome/free-solid-svg-icons';
import {H6, LabelSmall} from 'baseui/typography';
import {theme} from '../../../util';
import {ProductAreaSummary} from '../../dash/Dashboard'
import RouteLink from '../../common/RouteLink'
import {primitives} from '../../../util/theme'
import {borderColor} from '../../common/Style'
import {marginAll} from '../../Style'


const cardBackgroundColor = (areaType: AreaType) => {
  if (areaType === AreaType.PRODUCT_AREA) return "#C9EA95"
  else if (areaType === AreaType.IT) return "#E0F5FB"
  else if (areaType === AreaType.PROJECT) return "#E5E5E5"
  else return "#FED2B9"
}

const cardOverrides = (areaType: AreaType, hover: boolean) => {
  return {
    Root: {
      style: () => {
        const base = {
          // background: cardBackgroundColor(areaType),
          width: '100%',
          margin: theme.sizing.scale200,
        }
        return hover ? {
          ...base,
          ...borderColor(primitives.primary350)
          ,
          boxShadow: '0px 4px 2px -1px rgba(0,0,0,0.7);'
        } : base
      }
    },
    Body: {
      style: () => {
        return {
          marginBottom: 0
        }
      }
    },
    Contents: {
      style: () => {
        return {
          ...marginAll(theme.sizing.scale500)
        }
      }
    }
  } as CardOverrides
}

const MemberCounter = (props: {c: number}) => (
  <Block display="flex" alignItems="center">
    <LabelSmall>{props.c} personer</LabelSmall>
  </Block>
)

const TeamCounter = (props: {c: number}) => (
  <Block display="flex" alignItems="center">
    <LabelSmall>{props.c} team</LabelSmall>
  </Block>
)

type ProductAreaCardProps = {
  title: string
  areaType: AreaType
  teamSummary?: ProductAreaSummary
}

const ProductAreaCard = (props: ProductAreaCardProps) => {
  const [hover, setHover] = useState(false)
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <RouteLink href={`/area/${props.teamSummary?.productAreaId}`} hideUnderline plain>
        <Card overrides={cardOverrides(props.areaType, hover)}>
          <Block display='flex' alignItems='center' justifyContent='space-between'>
            <Block height="100%" display='flex' flexDirection='column' justifyContent='space-around'>
              <H6 marginTop="0" marginBottom={theme.sizing.scale100} $style={{
                wordBreak: 'break-word',
                color: hover ? primitives.primary350 : undefined,
                textDecoration: hover ? 'underline' : undefined
              }}>{props.title}</H6>
              <TeamCounter c={props.teamSummary?.teams || 0}/>
              <Block marginBottom={theme.sizing.scale100}/>
              <MemberCounter c={props.teamSummary?.uniqueResources || 0}/>
            </Block>
            <Block marginRight={hover ? '0px' : '10px'}>
              <FontAwesomeIcon icon={faChevronRight} color={theme.colors.primaryA}/>
            </Block>
          </Block>
        </Card>
      </RouteLink>
    </div>
  )
}

export default ProductAreaCard
