import React from 'react'
import { ResponsiveBar} from '@nivo/bar'

type ChartNivoProps = {
  chartData: { day: string; resources: number }[]
}

const ChartNivo = (props: ChartNivoProps) => {
  const { chartData } = props
  return (
    <ResponsiveBar
      data={chartData}
      keys={['resources']}
      indexBy="day"
      margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
      padding={0.4}
      valueScale={{ type: 'linear' }}
      colors="#3182CE"
      animate={true}
      enableLabel={false}
      axisTop={null}
      axisRight={null}
    />
  )
}

export default ChartNivo
