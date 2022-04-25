import * as React from 'react'
import { Block } from 'baseui/block'
import { LabelLarge } from 'baseui/typography'
import { LocationSummary } from '../dash/Dashboard'
import { TeamCounter } from '../ProductArea/View/ProductAreaCard'
import { theme } from '../../util'

const PanelTitle = (props: { title: string; locationSummary?: LocationSummary }) => {
  const { title, locationSummary } = props
  return (
    <>
      <Block width="100%">
        <LabelLarge marginBottom="8px" marginLeft={theme.sizing.scale100}>
          <span>{title}</span>
        </LabelLarge>
        {locationSummary && <TeamCounter teams={locationSummary.teamCount} people={locationSummary.resourceCount} />}
      </Block>
    </>
  )
}

export default PanelTitle
