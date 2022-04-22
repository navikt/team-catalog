import { Block } from 'baseui/block'
import { Card, CardOverrides } from 'baseui/card'
import { HeadingXSmall } from 'baseui/typography'
import React from 'react'
import { LocationSimple } from '../../constants'
import { theme } from '../../util'
import { primitives } from '../../util/theme'
import RouteLink from '../common/RouteLink'
import { borderColor } from '../common/Style'
import { TeamCounter } from '../ProductArea/View/ProductAreaCard'
import { marginAll } from '../Style'

export const cardOverrides = (hover: boolean) => {
  return {
    Root: {
      style: () => {
        const base = {
          backgroundColor: '#ECEFCC',
          width: '100%',
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

type SectionCardLinkProps = {
  section: LocationSimple
  teamCount: number
  resourceCount: number
}

const SectionCardLink = (props: SectionCardLinkProps) => {
  const { section, teamCount, resourceCount } = props

  const [hover, setHover] = React.useState(false)
  return (
    <>
      <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ marginTop: '15px' }}>
        <RouteLink href={`/location/${section.code}`} hideUnderline plain>
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
                  {section.displayName}
                </HeadingXSmall>
                <TeamCounter teams={teamCount} people={resourceCount} />
              </Block>
            </Block>
          </Card>
        </RouteLink>
      </div>
    </>
  )
}

export default SectionCardLink
