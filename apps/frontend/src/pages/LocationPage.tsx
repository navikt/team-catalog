import {HeadingLarge, HeadingMedium, LabelMedium} from 'baseui/typography/index'
import React, {useEffect, useRef, useState} from 'react'
import {Block} from 'baseui/block'
import Button from '../components/common/Button'
import {theme} from '../util'
import axios from 'axios'
import {env} from '../util/env'

interface LocationImage {
  id: string
  locationId: string
  content: string
  dimY: number
  bubbleScale: number
}

interface Locations {
  buildings: Building[]
}

interface Building {
  id: string
  name: string
  image: string
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
    ...([2, 3, 4, 5, 6, 7].map(i => ({
        id: "FA1",
        name: `Fyrstikkalléen 1-${i}`,
        image: '9c9caa49-98e8-44fb-b481-afec6ff87a29',
        dimY: 1,
        locations: locs[i] || []
      }))
    ),
    {
      id: "FA1-A6",
      name: 'Fyrstikkalléen 1-A6',
      image: '77727716-462e-4cbf-9fa7-8ac6fc3992bf',
      locations: []
    },
    {
      id: "FA1-A7",
      name: 'Fyrstikkalléen 1-A7',
      image: '928fae70-8b2e-4900-b2d9-868f7c80eeca',
      locations: []
    },
    {
      id: "FA1-A8",
      name: 'Fyrstikkalléen 1-A8',
      image: '37806dfc-913b-4875-aa5b-325eb5c5ed43',
      locations: []
    },
    {
      id: "S2-3",
      name: 'Sannergata 2-3',
      image: '7822b3c9-c3fd-41f0-81a2-2da6961be510',
      locations: []
    },
    {
      id: "S2-4",
      name: 'Sannergata 2-4',
      image: '7ba133d6-225c-4d4e-a8d5-4de49fd53a21',
      locations: []
    },
    {
      id: "S2-5",
      name: 'Sannergata 2-5',
      image: '4d11f95c-f8d3-41a4-ac1f-22588c5d9286',
      locations: []
    },
    {
      id: "S2-6",
      name: 'Sannergata 2-6',
      image: '4dafbba0-e0df-4c44-b95c-329e6729a0c3',
      locations: []
    },
    {
      id: "S2-7",
      name: 'Sannergata 2-7',
      image: '789fe5d4-d052-476b-9e82-6587cb10ff03',
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
  const [bid, setBid] = useState<number>(3)
  const building = locations.buildings[bid]
  const width = window.innerWidth * .75

  return (
    <Block>
      <HeadingLarge>Lokasjoner</HeadingLarge>

      <Block display={'flex'} justifyContent={'space-between'} flexWrap>
        {locations.buildings.map((b, i) =>
          <Button key={i} onClick={() => setBid(i)} $style={{marginTop: theme.sizing.scale300}} size='mini'>{b.name}</Button>
        )}
      </Block>

      <Block display='flex'>
        <BuildingPlan building={building} width={width}/>
      </Block>

    </Block>
  )
}

const areaId = (l: string) => l.substr(l.indexOf('-') + 1)

const BuildingPlan = (props: {building: Building, width: number}) => {
  const {building, width} = props
  const {name, locations, image} = building

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

  const [locationImage, setLocationImage] = useState<LocationImage>()
  const dimY = locationImage?.dimY || 1
  const bubbleScale = locationImage?.bubbleScale || 1
  const teamBubbleSize = 50 * bubbleScale
  const fontSize = 20 * bubbleScale

  useEffect(() => {
    axios.get<LocationImage>(`${env.teamCatalogBaseUrl}/location/image/${image}`).then(r => setLocationImage(r.data))
  }, [image])

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
        backgroundImage: locationImage ? `url(data:image;base64,${locationImage.content})` : undefined,
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
