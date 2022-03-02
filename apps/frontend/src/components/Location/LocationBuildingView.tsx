import { Block } from 'baseui/block'
import { LocationSimple } from '../../constants'
import { LocationSummary } from '../dash/Dashboard'
import SectionCardLink from './SectionCardLink'

type LocationBuildingViewProps = {
    stats: { [k: string]: LocationSummary }
    sectionList: LocationSimple[]
}

const LocationBuildingView = (props: LocationBuildingViewProps) => {
    const {stats, sectionList} = props
    return <>
        <Block width="40%" marginTop='30px'>
            {sectionList.map(s => (
                <SectionCardLink 
                    section={s}
                    teamCount={stats[s.code].teamCount} 
                    resourceCount={stats[s.code].resourceCount}
                />
            ))}
        </Block>
    </>
}

export default LocationBuildingView