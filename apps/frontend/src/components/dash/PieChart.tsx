import React, { useState } from 'react'
import { Block } from 'baseui/block'
import { theme } from '../../util'
import { Label1 } from 'baseui/typography'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle } from '@fortawesome/free-solid-svg-icons'
import { Card } from 'baseui/card'

interface PieData {
  label: string,
  size: number
}

interface PieDataExpanded extends PieData {
  color: string
  sizeFraction: number
  start: number
}

interface PieProps {
  title: string
  leftLegend?: boolean
  data: PieData[]
  radius: number
}

export const Pie = (props: PieProps) => {
  const {radius, data, title, leftLegend} = props
  const totSize = data.map(d => d.size).reduce((a, b) => a + b, 0)

  const colorsBase = [
    '#a6cee3',
    '#1f78b4',
    '#b2df8a',
    '#33a02c',
    '#fb9a99',
    '#e31a1c',
    '#fdbf6f',
    '#ff7f00',
    '#cab2d6',
    '#6a3d9a',
    '#ffff99',
    '#b15928',

    // original palette
    // '#2196f3',
    // '#03a9f4',
    // '#00bcd4',
    // '#009688',
    // '#4caf50',
    // '#8bc34a',
    // '#cddc39',
    // '#ffeb3b',
    // '#ffc107',
    // '#ff9800',
    // '#ff5722',
    // '#f44336',
    // '#e91e63',
    // '#9c27b0',
    // '#673ab7',
    // '#3f51b5',
    // '#795548',

    // Nav farger
    // '#C30000',
    // '#FF9100',
    // '#A2AD00',
    // '#06893A',
    // '#634689',
    // '#005B82',
    // '#0067C5',
    // '#66CBEC',
  ]

  const splice = Math.random() * colorsBase.length
  const colors = [...colorsBase.slice(splice), ...colorsBase.slice(0, splice)]

  let s = 0
  const expData: PieDataExpanded[] = data.map((d, idx) => {
    // last color can't be same color as first color, as they are next to each other
    const colorIndex = data.length - 1 === colors.length && idx >= data.length - 1 ? idx + 1 : idx
    const pieData = {...d, color: colors[colorIndex % colors.length], start: s, sizeFraction: d.size / totSize}
    s += pieData.sizeFraction
    return pieData
  })

  return <PieViz data={expData} radius={radius} title={title} leftLegend={!!leftLegend}/>
}

const PieViz = (props: { data: PieDataExpanded[], radius: number, title: string, leftLegend: boolean }) => {
  const {radius, data, title, leftLegend} = props
  const [hover, setHover] = useState<number>()
  return (
    <Card>
      <div onMouseLeave={() => setHover(undefined)}>
        <Block display='flex' alignItems='center' flexDirection={leftLegend ? 'row-reverse' : 'row'}>
          <Block>
            <svg height={radius * 2} width={radius * 2} viewBox='-1.1 -1.1 2.2 2.2' style={{transform: 'rotate(-90deg)'}}>
              {data.map((d, idx) =>
                <Wedge key={idx} size={d.sizeFraction} start={d.start} color={d.color}
                       onMouseOver={() => setHover(idx)} hover={idx === hover}
                />
              )}
            </svg>
          </Block>
          <Block marginLeft={theme.sizing.scale750} marginRight={theme.sizing.scale750}>
            <Label1 marginBottom={theme.sizing.scale400}>{title}</Label1>
            {data.map((d, idx) =>
              <div key={idx} onMouseOver={() => setHover(idx)}>
                <Block backgroundColor={idx === hover ? theme.colors.accent50 : theme.colors.white}
                       $style={{cursor: 'default'}} display='flex' alignItems='center'>
                  <FontAwesomeIcon icon={faCircle} color={d.color}/>
                  <Block width={theme.sizing.scale1200} display='flex' justifyContent='flex-end'>{d.size}</Block>
                  <Block width={theme.sizing.scale1000} display='flex' justifyContent='flex-end'>{(d.sizeFraction * 100).toFixed(0)}%</Block>
                  <Block marginLeft={theme.sizing.scale400}>{d.label}</Block>
                </Block>
              </div>
            )}
          </Block>
        </Block>
      </div>
    </Card>
  )
}

const pi = 3.1415926
const tau = 2 * pi

const Wedge = (props: { size: number, start: number, color: string, hover: boolean, onMouseOver: () => void }) => {
  const {size, start, color, hover} = props
  const scale = hover ? 1.05 : 1
  const d = `
  M ${Math.cos(start * tau) * scale} ${Math.sin(start * tau) * scale}
  A ${scale} ${scale} 0 ${size >= .5 ? 1 : 0} 1 ${Math.cos((start + size) * tau) * scale} ${Math.sin((start + size) * tau) * scale}
  L 0 0
  `
  return <path d={d} fill={color} onMouseOver={props.onMouseOver}/>
}
