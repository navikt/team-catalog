import * as React from 'react'
import { Card, StyledBody } from 'baseui/card'
import { Cluster, ProductTeam, Resource } from '../../../constants'
import { LabelMedium, ParagraphMedium } from 'baseui/typography'
import { Block, BlockProps } from 'baseui/block'
import { theme } from '../../../util'
import RouteLink from '../../common/RouteLink'
import { marginAll } from '../../Style'
import { cardShadow } from '../../common/Style'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { intl } from '../../../util/intl/intl'
import { faHubspot } from '@fortawesome/free-brands-svg-icons'
import { useDash } from '../../dash/Dashboard'

type CardProductAreaProps = {
  teams?: ProductTeam[]
  cluster: Cluster
  resource?: Resource
}

const contentBlockProps: BlockProps = {
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  marginTop: theme.sizing.scale500,
}

const TextWithLabel = (props: { label: string; text: string | number }) => (
  <Block display="flex" alignItems="baseline">
    <Block marginRight={theme.sizing.scale600}>
      <LabelMedium marginBottom="0">{props.label}:</LabelMedium>
    </Block>
    <Block>
      <ParagraphMedium marginBottom={0} marginTop={0}>
        {props.text}
      </ParagraphMedium>
    </Block>
  </Block>
)

const CardCluster = (props: CardProductAreaProps) => {
  const member = props.resource ? props.cluster.members.filter((m) => m.navIdent === props.resource?.navIdent).pop() : undefined
  const dash = useDash()
  const medlemmerCount = (function () {
    const lookupClusterSummary = dash?.clusters.find((cl) => cl.clusterId === props.cluster.id)
    if (lookupClusterSummary) {
      return lookupClusterSummary.uniqueResources
    } else {
      return props.cluster.members.length
    }
  })()

  return (
    <Card
      title={
        <RouteLink href={`/cluster/${props.cluster.id}`} hideUnderline>
          {props.cluster.name}
        </RouteLink>
      }
      overrides={{
        Root: {
          style: {
            ...cardShadow.Root.style,
            width: '450px',
            ...marginAll(theme.sizing.scale200),
          },
        },
        Body: {
          style: {
            marginBottom: 0,
          },
        },
        Title: {
          style: {
            marginBottom: 0,
          },
        },
      }}
    >
      <StyledBody>
        <Block {...contentBlockProps}>
          <Block flex={1}>
            {member && <TextWithLabel label="Roller" text={member?.roles.map((role) => intl.getString(role)).join(', ') || ''} />}
            <TextWithLabel label="Medlemmer" text={medlemmerCount} />
            <TextWithLabel label="Team" text={props.teams?.length || 0} />
          </Block>
          <Block flex="0 0 50px">
            <FontAwesomeIcon icon={faHubspot} size="2x" color={theme.colors.accent300} />
          </Block>
        </Block>
      </StyledBody>
    </Card>
  )
}

export default CardCluster
