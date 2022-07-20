import * as React from 'react'
import { Card, StyledBody } from 'baseui/card'
import { ProductArea, ProductTeam, Resource } from '../../../constants'
import { LabelMedium, ParagraphMedium } from 'baseui/typography'
import { Block, BlockProps } from 'baseui/block'
import { theme } from '../../../util'
import RouteLink from '../../common/RouteLink'
import { marginAll } from '../../Style'
import { cardShadow } from '../../common/Style'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBuilding } from '@fortawesome/free-solid-svg-icons'
import { intl } from '../../../util/intl/intl'
import { DashData, useDash } from '../../dash/Dashboard'

type CardProductAreaProps = {
  teams?: ProductTeam[]
  productArea: ProductArea
  resource?: Resource
  dash?: DashData
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

const CardProductArea = (props: CardProductAreaProps) => {
  const member = props.resource ? props.productArea.members.filter((m) => m.navIdent === props.resource?.navIdent).pop() : undefined
  const dash = useDash()

  return (
    <Card
      title={
        <RouteLink href={`/area/${props.productArea.id}`} hideUnderline>
          {props.productArea.name}
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
          {dash && (
            <>
              <Block flex={1}>
                {member && <TextWithLabel label="Roller" text={member?.roles.map((role) => intl.getString(role)).join(', ') || ''} />}
                {dash?.areaSummaryMap[props.productArea.id] && (
                  <>
                    <TextWithLabel label="Medlemmer" text={dash.areaSummaryMap[props.productArea.id].uniqueResourcesCount} />
                  </>
                )}

                {dash?.areaSummaryMap[props.productArea.id] && (
                  <>
                    <TextWithLabel label="Team" text={dash?.areaSummaryMap[props.productArea.id].totalTeamCount} />
                  </>
                )}
              </Block>
              <Block flex="0 0 50px">
                <FontAwesomeIcon icon={faBuilding} size="2x" color={theme.colors.accent300} />
              </Block>
            </>
          )}
        </Block>
      </StyledBody>
    </Card>
  )
}

export default CardProductArea
