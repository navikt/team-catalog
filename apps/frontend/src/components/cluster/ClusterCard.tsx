import { useState } from 'react'
import { Card, CardOverrides } from 'baseui/card'
import { Block } from 'baseui/block'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faUserCircle, faUsers } from '@fortawesome/free-solid-svg-icons'
import { HeadingXSmall, LabelSmall } from 'baseui/typography'
import { theme } from '../../util'
import { ClusterSummary2 } from '../dash/Dashboard'
import RouteLink from '../common/RouteLink'
import { primitives } from '../../util/theme'
import { borderColor } from '../common/Style'
import { marginAll } from '../Style'
import { Cluster } from '../../constants'

const cardBackgroundColor = () => {
  return '#D0A691'
}

const cardOverrides = (hover: boolean) => {
  return {
    Root: {
      style: () => {
        const base = {
          background: cardBackgroundColor(),
          margin: theme.sizing.scale200,
        }
        return hover
          ? {
              ...base,
              ...borderColor(primitives.primary350),
              boxShadow: '0px 4px 2px -1px rgba(0,0,0,0.7);',
            }
          : base
      },
    },
    Body: {
      style: () => {
        return {
          marginBottom: 0,
        }
      },
    },
    Contents: {
      style: () => {
        return {
          ...marginAll(theme.sizing.scale500),
        }
      },
    },
  } as CardOverrides
}

const TeamCounter = (props: { teams: number; people: number }) => (
  <Block display="flex">
    <Block display="flex" marginLeft={theme.sizing.scale400}>
      <FontAwesomeIcon icon={faUsers} />
      <LabelSmall marginLeft={theme.sizing.scale100} width={theme.sizing.scale1600}>
        {props.teams} team
      </LabelSmall>
    </Block>
    <Block display="flex">
      <FontAwesomeIcon icon={faUserCircle} />
      <LabelSmall marginLeft={theme.sizing.scale100}>{props.people} personer</LabelSmall>
    </Block>
  </Block>
)

type ClusterCardProps = {
  cluster: Cluster
  clusterSummary?: ClusterSummary2
}

export const ClusterCard = (props: ClusterCardProps) => {
  const [hover, setHover] = useState(false)
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <RouteLink href={`/cluster/${props.cluster.id}`} hideUnderline plain>
        <Card overrides={cardOverrides(hover)}>
          <Block display="flex" alignItems="center" justifyContent="space-between">
            <Block height="100%" display="flex" flexDirection="column" justifyContent="space-around">
              <HeadingXSmall
                marginTop="0"
                marginBottom={theme.sizing.scale100}
                $style={{
                  wordBreak: 'break-word',
                  color: hover ? primitives.primary350 : undefined,
                  textDecoration: hover ? 'underline' : undefined,
                }}
              >
                {props.cluster.name}
              </HeadingXSmall>
              <TeamCounter teams={props.clusterSummary?.teamCount || 0} people={props.clusterSummary?.totalUniqueResourcesCount || 0} />
            </Block>
            <Block marginRight={hover ? '0px' : '10px'}>
              <FontAwesomeIcon icon={faChevronRight} color={theme.colors.primaryA} />
            </Block>
          </Block>
        </Card>
      </RouteLink>
    </div>
  )
}
