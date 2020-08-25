import {HeadingLarge, HeadingMedium, LabelMedium} from 'baseui/typography/index'
import React, {useEffect, useRef, useState} from 'react'
import {Block} from 'baseui/block'
import Button from '../components/common/Button'
import {theme} from '../util'
import axios from 'axios'
import {env} from '../util/env'
import {Spinner} from '../components/common/Spinner'
import {Floor, Location, PageResponse} from '../constants'


type lteam = {name: string, locations: Location[]}
const teams: lteam[] = [
  {
    name: 'Voff', locations: [
      {floorId: 'fa1-5', locationCode: 'B508', x: 128, y: 274},
      {floorId: 'fa1-5', locationCode: 'B513', x: 183, y: 90}]
  },
  {
    name: 'PAW', locations: [
      {floorId: 'fa1-5', locationCode: 'B517', x: 354, y: 90}]
  },
  {
    name: 'Forskudd', locations: [
      {floorId: 'fa1-5', locationCode: 'B521', x: 544, y: 90}]
  },
  {
    name: 'Datajeger', locations: [
      {floorId: 'fa1-a6', locationCode: 'A641', x: 544, y: 90}]
  },
]

export const LocationPage = () => {
  const [fid, setFid] = useState<string>('fa1-5')
  const [floors, setFloors] = useState<Floor[]>([])
  const floor = floors.find(f => f.floorId === fid)
  const width = window.innerWidth * .75

  useEffect(() => {
    axios.get<PageResponse<Floor>>(`${env.teamCatalogBaseUrl}/location/floor`).then(r => {
      const floorData = r.data.content
      floorData.sort((a, b) => a.name.localeCompare(b.name))
      setFloors(floorData)
    })
  }, [])

  return (
    <Block>
      <HeadingLarge>Lokasjoner</HeadingLarge>

      <Block display={'flex'} justifyContent={'space-between'} flexWrap>
        {floors.map((b, i) =>
          <Button key={i} onClick={() => setFid(b.floorId)} $style={{marginTop: theme.sizing.scale300}} size='mini'>{b.name}</Button>
        )}
      </Block>

      <Block display='flex'>
        {floor && <FloorPlan floor={floor} width={width}/>}
        {!floor && <Spinner size='64px'/>}
      </Block>

    </Block>
  )
}

const FloorPlan = (props: {floor: Floor, width: number}) => {
  const {floor, width} = props
  const [team, setTeam] = useState<lteam>()

  const hover = (id?: string) => {
    const ft = teams.find(t => {
      const locationsMatch = t.locations.filter(l => id === l.locationCode)?.length
      return !!locationsMatch
    })
    setTeam(ft)
  }

  const ref = useRef<SVGSVGElement>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [target, setTarget] = useState<EventTarget>()
  useEffect(() => {
    setLocations(teams.flatMap(t => t.locations).filter(l => l.floorId === floor.floorId))
  }, [floor.floorId])

  const pos = (e: React.MouseEvent<SVGElement>) => {
    const CTM = ref.current!.getScreenCTM()!;
    return {
      x: Math.ceil((e.clientX - CTM.e) / CTM.a),
      y: Math.ceil((e.clientY - CTM.f) / CTM.d)
    };
  }

  const onDown = (e: React.MouseEvent<SVGElement>) => {
    if ((e.target as SVGElement).classList.contains('drag')) setTarget(e.target);
  }
  const onMove = (e: React.MouseEvent<SVGElement>) => {
    e.preventDefault()
    if (target) {
      const xy = pos(e)
      const id = (target as SVGElement).id
      const tar = locations.find(i => i.locationCode === id)
      if (!tar) return // shouldn't happen really..
      if (xy.x === tar.x && xy.y == tar.y) return
      const other = locations.filter(i => i.locationCode !== id)
      setLocations([...other, {...tar, x: xy.x, y: xy.y}])
    }
  }
  const onUp = (e: React.MouseEvent<SVGElement>) => {
    if (target) {
      clear()
    } else {
      const xy = pos(e)
      const locationCode = `B${Math.ceil(Math.random() * 999)}`
      const newIndicators = [...locations, {floorId: floor.floorId, locationCode, x: xy.x, y: xy.y}]
      console.log(JSON.stringify(newIndicators));
      setLocations(newIndicators)
    }
  }
  const onLeave = () => {
    if (target) {
      const id = (target as SVGElement).id
      setLocations(locations.filter(i => i.locationCode !== id))
      clear()
    }
  }
  const clear = () => setTarget(undefined)

  const teamBubbleSize = 50 * floor.bubbleScale
  const fontSize = 20 * floor.bubbleScale

  return <Block display={'flex'} flexDirection={'column'}>
    <HeadingMedium>{floor.name}</HeadingMedium>
    <LabelMedium height={'20px'}>{team?.name}</LabelMedium>
    <Block>
      <Block $style={{
        backgroundImage: `url(${env.teamCatalogBaseUrl}/location/image/${floor.floorId})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain'
      }} display='flex'>
        <svg height={width * floor.dimY} width={width} viewBox={`0 0 1000 ${1000 * floor.dimY}`}
             onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onLeave}
             ref={ref}>
          {locations.map(loc =>
            <Indicator key={loc.locationCode} id={loc.locationCode} hover={hover} fontSize={fontSize}
                       cx={loc.x} cy={loc.y} rx={teamBubbleSize} ry={teamBubbleSize}/>
          )}
        </svg>
      </Block>
    </Block>
  </Block>
}

const Indicator = (props: {cx: number, cy: number, rx: number, ry: number, id: string, hover?: (id?: string) => void, fontSize: number}) => {
  const {cx, cy, rx, ry, id, fontSize} = props
  const [hover, setHover] = useState<boolean>(false)

  useEffect(() => props.hover && props.hover(hover ? id : undefined), [hover])

  const strokeWidth = 2
  const fillOpacity = .2

  const textAdjustX = rx * .5
  const textAdjustY = fontSize / 2
  return <>
    <text style={{font: `italic ${fontSize}px sans-serif`}} x={cx - textAdjustX} y={cy + textAdjustY} fill={hover ? 'red' : 'blue'}>{id}</text>
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} id={id} className='drag'
             stroke={hover ? 'red' : 'black'} strokeWidth={strokeWidth} strokeDasharray={hover ? undefined : 10}
             fill={'red'} fillOpacity={hover ? fillOpacity : 0}
             onMouseOver={() => setHover(true)} onMouseLeave={() => setHover(false)}
    />
  </>
}
