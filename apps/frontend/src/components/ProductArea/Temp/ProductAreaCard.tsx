import * as React from 'react'
import {Card, CardOverrides} from 'baseui/card'
import {Block} from 'baseui/block';
import {AreaType} from '../../../constants';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faHouseUser, faUsers} from '@fortawesome/free-solid-svg-icons';
import {H6} from 'baseui/typography';
import {theme} from '../../../util';
import {TeamSummary} from '../../dash/Dashboard'
import RouteLink from '../../common/RouteLink'


// Bytte fargene her til på bruke de samme fra mainsearch i behandlingskatalogen
const cardBackgroundColor = (areaType: AreaType) => {
  if (areaType === AreaType.PRODUCT_AREA) return "#C9EA95"
  else if (areaType === AreaType.IT) return "#E0F5FB"
  else if (areaType === AreaType.PROJECT) return "#E5E5E5"
  else return "#FED2B9"
}
const cardOverrides = (areaType: AreaType) => {
  return {
    Root: {
      style: () => {
        return {
          background: cardBackgroundColor(areaType),
          width: '180px',
          padding: theme.sizing.scale500,
          margin: theme.sizing.scale300
        }
      }
    },
    Body: {
      style: () => {
        return {
          height: '180px',
        }
      }
    }
  } as CardOverrides
}

const MemberCounter = (props: {c: number}) => (
  <Block display="flex" alignItems="center"> <FontAwesomeIcon icon={faHouseUser}/> &nbsp; <p>{props.c} personer</p></Block>
)

const TeamCounter = (props: {c: number}) => (
  <Block display="flex" alignItems="center"> <FontAwesomeIcon icon={faUsers}/> &nbsp; <p>{props.c} team</p></Block>
)

type ProductAreaCardProps = {
  title: string
  areaType: AreaType
  teamSummary?: TeamSummary
}

const ProductAreaCard = (props: ProductAreaCardProps) => {
  return (
    <Card overrides={cardOverrides(props.areaType)}>
      <RouteLink href={`/area/${props.teamSummary?.productAreaId}`} plain>
        <Block height="100%" display='flex' flexDirection='column' justifyContent='space-around'>
          <TeamCounter c={props.teamSummary?.teams || 0}/>
          <H6 marginTop="0" marginBottom='0'>{props.title}</H6>
          <MemberCounter c={props.teamSummary?.uniqueResources || 0}/>
        </Block>
      </RouteLink>
    </Card>
  )
}

export default ProductAreaCard
