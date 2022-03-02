import { useRef } from 'react'
import { generateCountriesData } from '@nivo/generators'

import { BarCanvas, BarCanvasLayer, BarDatum, canvasDefaultProps } from '@nivo/bar'

const keys = ['hot dogs', 'burgers', 'sandwich', 'kebab', 'fries']
const commonProps = {
  width: 850,
  height: 500,
  margin: { top: 60, right: 80, bottom: 60, left: 80 },
  data: generateCountriesData(keys, { size: 5 }) as BarDatum[],
  indexBy: 'country',
  keys,
  padding: 0.2,
  labelSkipWidth: 16,
  labelSkipHeight: 16,
}
const ChartLocation = () => {
  
  return (
    <BarCanvas
      {...commonProps}
      legends={[
        {
          anchor: 'bottom',
          dataFrom: 'keys',
          direction: 'row',
          itemHeight: 20,
          itemWidth: 110,
          translateY: 60,
        },
      ]}
    />
  )
}

export default ChartLocation
