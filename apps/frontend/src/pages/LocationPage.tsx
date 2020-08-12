import {HeadingLarge, HeadingMedium, LabelMedium} from 'baseui/typography/index'
import React, {useEffect, useRef, useState} from 'react'
import {Block} from 'baseui/block'
import Button from '../components/common/Button'
import {theme} from '../util'

interface Locations {
  buildings: Building[]
}

interface Building {
  id: string
  name: string
  image: string
  dimY: number
  bubbleScale?: number
  locations: Location[]
}

interface Location {
  id: string
  x: number
  y: number
}

const locs: {[key: number]: Location[]} = {
  5: [
    {id: 'FA1-B508', x: 128, y: 274},
    {id: 'FA1-B513', x: 183, y: 90},
    {id: 'FA1-B517', x: 354, y: 90},
    {id: 'FA1-B521', x: 544, y: 90},
  ]
}

const locations: Locations = {
  buildings: [
    ...([1, 2, 3, 4, 5, 6, 7].map(i => ({
        id: "FA1",
        name: `Fyrstikkalléen 1-${i}`,
        image: 'fa1-bcd',
        dimY: 1,
        locations: locs[i] || []
      }))
    ),
    {
      id: "FA1-A6",
      name: 'Fyrstikkalléen 1-A6',
      image: 'fa1-a6',
      dimY: .46,
      locations: []
    },
    {
      id: "FA1-A7",
      name: 'Fyrstikkalléen 1-A7',
      image: 'fa1-a7',
      dimY: .46,
      locations: []
    },
    {
      id: "FA1-A8",
      name: 'Fyrstikkalléen 1-A8',
      image: 'fa1-a8',
      dimY: .51,
      locations: []
    },
    {
      id: "S2-3",
      name: 'Sannergata 2-3',
      image: 's2-3',
      dimY: .47,
      bubbleScale: .6,
      locations: []
    },
    {
      id: "S2-4",
      name: 'Sannergata 2-4',
      image: 's2-4',
      dimY: .277,
      bubbleScale: .6,
      locations: []
    },
    {
      id: "S2-5",
      name: 'Sannergata 2-5',
      image: 's2-5',
      dimY: .28,
      bubbleScale: .6,
      locations: []
    },
    {
      id: "S2-6",
      name: 'Sannergata 2-6',
      image: 's2-6',
      dimY: .268,
      bubbleScale: .6,
      locations: []
    },
    {
      id: "S2-7",
      name: 'Sannergata 2-7',
      image: 's2-7',
      dimY: .288,
      bubbleScale: .6,
      locations: []
    }
  ]
}


type lteam = {name: string, location: string[]}
const teams: lteam[] = [
  {name: 'Voff', location: ['FA1-B508', 'FA1-B513']},
  {name: 'PAW', location: ['FA1-B517']},
  {name: 'Forskudd', location: ['FA1-B521']},
]

export const LocationPage = () => {
  const [bid, setBid] = useState<number>(4)
  const building = locations.buildings[bid]

  return (
    <Block>
      <HeadingLarge>Lokasjoner</HeadingLarge>

      <Block>
        {locations.buildings.map((b, i) =>
          <Button key={i} onClick={() => setBid(i)} marginLeft={i > 0} $style={{marginTop: theme.sizing.scale300}} size='mini'>{b.name}</Button>
        )}
      </Block>

      <Block display='flex'>
        <BuildingPlan building={building}/>
      </Block>

    </Block>
  )
}

const areaId = (l: string) => l.substr(l.indexOf('-') + 1)

const BuildingPlan = (props: {building: Building}) => {
  const width = window.innerWidth * .75
  const {name, locations, dimY, image} = props.building
  const bubbleScale = props.building.bubbleScale || 1
  const teamBubbleSize = 50 * bubbleScale
  const fontSize = 20 * bubbleScale

  const [team, setTeam] = useState<lteam>()

  const hover = (id?: string) => {
    const ft = teams.find(t => {
      const locationsMatch = t.location.filter(l => id === l)?.length
      return !!locationsMatch
    })
    setTeam(ft)
  }

  const ref = useRef<SVGSVGElement>(null)
  const [indicators, setIndicators] = useState<Location[]>([])
  useEffect(() => {
    setIndicators(locations)
  }, [locations])

  const pos = (e: React.MouseEvent<SVGElement>) => {
    const CTM = ref.current!.getScreenCTM()!;
    return {
      x: Math.ceil((e.clientX - CTM.e) / CTM.a),
      y: Math.ceil((e.clientY - CTM.f) / CTM.d)
    };
  }

  const [target, setTarget] = useState<EventTarget>()

  const onDown = (e: React.MouseEvent<SVGElement>) => {
    if ((e.target as SVGElement).classList.contains('drag')) setTarget(e.target);
  }
  const onMove = (e: React.MouseEvent<SVGElement>) => {
    e.preventDefault()
    if (target) {
      const xy = pos(e)
      const id = (target as SVGElement).id
      const tar = indicators.find(i => i.id === id)
      if (!tar) return // shouldn't happen really..
      if (xy.x === tar.x && xy.y == tar.y) return
      const other = indicators.filter(i => i.id !== id)
      setIndicators([...other, {...tar, x: xy.x, y: xy.y}])
    }
  }
  const onUp = (e: React.MouseEvent<SVGElement>) => {
    if (target) {
      clear()
    } else {
      const xy = pos(e)
      const id = `FA1-B${Math.ceil(Math.random() * 999)}`
      const newIndicators = [...indicators, {id, x: xy.x, y: xy.y}]
      console.log(JSON.stringify(newIndicators));
      setIndicators(newIndicators)
    }
  }
  const onLeave = () => {
    if (target) {
      const id = (target as SVGElement).id
      setIndicators(indicators.filter(i => i.id !== id))
      clear()
    }
  }
  const clear = () => setTarget(undefined)

  return <Block display={'flex'} flexDirection={'column'}>
    <HeadingMedium>{name}</HeadingMedium>
    <LabelMedium height={'20px'}>{team?.name}</LabelMedium>
    <Block>
      <Block $style={{
        backgroundImage: `url(/location/image/${image})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain'
      }} display='flex'>
        <svg height={width * dimY} width={width} viewBox={`0 0 1000 ${1000 * dimY}`}
             onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onLeave}
             ref={ref}>
          {indicators.map(ind =>
            <Indicator key={ind.id} id={ind.id} hover={hover} fontSize={fontSize}
                       cx={ind.x} cy={ind.y} rx={teamBubbleSize} ry={teamBubbleSize}/>
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
    <text style={{font: `italic ${fontSize}px sans-serif`}} x={cx - textAdjustX} y={cy + textAdjustY} fill={hover ? 'red' : 'blue'}>{areaId(id)}</text>
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} id={id} className='drag'
             stroke={hover ? 'red' : 'black'} strokeWidth={strokeWidth} strokeDasharray={hover ? undefined : 10}
             fill={'red'} fillOpacity={hover ? fillOpacity : 0}
             onMouseOver={() => setHover(true)} onMouseLeave={() => setHover(false)}
    />
  </>
}
