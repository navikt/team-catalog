import { Block } from 'baseui/block'
import { LocationSimple } from '../../constants'
import { LocationSummary } from '../dash/Dashboard'
import ChartNivo from './ChartNivo'
import SectionCardLink from './SectionCardLink'

type LocationBuildingViewProps = {
  stats: { [k: string]: LocationSummary }
  chartData: { day: string, resources: number}[]
  sectionList: LocationSimple[]
}

const LocationBuildingView = (props: LocationBuildingViewProps) => {
  const { stats, sectionList, chartData } = props
  return (
    <Block width="100%" display="flex" justifyContent="space-between">
      <Block width="40%" marginTop="30px">
        {sectionList.map((s) => (
          <SectionCardLink section={s} teamCount={stats[s.code].teamCount} resourceCount={stats[s.code].resourceCount} />
        ))}
      </Block>
      <Block width="40%" height="500px">
        <ChartNivo chartData={chartData} />
      </Block>
    </Block>
  )
}

export default LocationBuildingView
