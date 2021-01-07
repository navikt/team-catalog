import * as React from 'react'
import {useState} from 'react'
import {Card, CardOverrides} from 'baseui/card'
import {Block} from 'baseui/block';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronRight, faUserCircle, faUsers} from '@fortawesome/free-solid-svg-icons';
import {H6, LabelSmall} from 'baseui/typography';
import {theme} from '../../util';
import {ClusterSummary} from '../dash/Dashboard'
import RouteLink from '../common/RouteLink'
import {primitives} from '../../util/theme'
import {borderColor} from '../common/Style'
import {marginAll} from '../Style'


const cardBackgroundColor = () => {
  return "#D0A691"
}

// const cardBackgroundColor = (areaType: AreaType) => {
//   if (areaType === AreaType.PRODUCT_AREA) return "#CDE7D8"
//   else if (areaType === AreaType.IT) return "#CCE1F3"
//   else if (areaType === AreaType.PROJECT) return "#ECEFCC"
//   else return "#E0DAE7"
// }

const cardOverrides = (hover: boolean) => {
  return {
    Root: {
      style: () => {
        const base = {
          // width: '100%',
          background: cardBackgroundColor(),
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

const TeamCounter = (props: {teams: number, people: number}) => (
  <Block display="flex">
    <Block display='flex' marginLeft={theme.sizing.scale400}>
      <FontAwesomeIcon icon={faUsers}/>
      <LabelSmall marginLeft={theme.sizing.scale100} width={theme.sizing.scale1600}>{props.teams} team</LabelSmall>
    </Block>
    <Block display='flex'>
      <FontAwesomeIcon icon={faUserCircle}/>
      <LabelSmall marginLeft={theme.sizing.scale100}>{props.people} personer</LabelSmall>
    </Block>
  </Block>
)


type ClusterCardProps = {
  title: string
  clusterSummary?: ClusterSummary
}

export const ClusterCard = (props: ClusterCardProps) => {
  const [hover, setHover] = useState(false)
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <RouteLink href={`/cluster/${props.clusterSummary?.clusterId}`} hideUnderline plain>
        <Card overrides={cardOverrides(hover)}>
          <Block display='flex' alignItems='center' justifyContent='space-between'>
            <Block height="100%" display='flex' flexDirection='column' justifyContent='space-around'>
              <H6 marginTop="0" marginBottom={theme.sizing.scale100} $style={{
                wordBreak: 'break-word',
                color: hover ? primitives.primary350 : undefined,
                textDecoration: hover ? 'underline' : undefined
              }}>{props.title}</H6>
              <TeamCounter teams={props.clusterSummary?.teams || 0} people={props.clusterSummary?.uniqueResources || 0}/>
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
