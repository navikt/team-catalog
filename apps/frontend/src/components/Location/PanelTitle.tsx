import * as React from 'react'
import { Block } from 'baseui/block'
import { Label1 } from 'baseui/typography'
import { LocationSummary } from '../dash/Dashboard'
import { TeamCounter } from '../ProductArea/View/ProductAreaCard'
import { theme } from '../../util'

const PanelTitle = (props: { title: string, locationSummary?: LocationSummary}) => {
    const { title, locationSummary } = props
    return <>
        <Block width="100%" >
            <Label1 marginBottom="8px" marginLeft={theme.sizing.scale100}><span>{title}</span></Label1>
            {locationSummary && <TeamCounter teams={locationSummary.teamCount} people={locationSummary.resourceCount}/>}
        </Block>
    </>
}

export default PanelTitle