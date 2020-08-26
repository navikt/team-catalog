import {HeadingLarge, HeadingMedium, LabelMedium, LabelSmall} from 'baseui/typography'
import React, {useEffect, useRef, useState} from 'react'
import {Block} from 'baseui/block'
import Button from '../components/common/Button'
import {theme} from '../util'
import axios from 'axios'
import {env} from '../util/env'
import {Spinner} from '../components/common/Spinner'
import {Floor, Location, PageResponse, ProductTeam} from '../constants'
import {useAllTeams} from '../api'
import {StatefulTooltip} from 'baseui/tooltip'
import RouteLink from '../components/common/RouteLink'
import {useParams} from 'react-router-dom'

export const useFloors = () => {
  const [floors, setFloors] = useState<Floor[]>([])
  useEffect(() => {
    axios.get<PageResponse<Floor>>(`${env.teamCatalogBaseUrl}/location/floor`).then(r => {
      const floorData = r.data.content
      floorData.sort((a, b) => a.name.localeCompare(b.name))
      setFloors(floorData)
    })
  }, [])

  return floors
}

export const LocationPage = () => {
  const params = useParams<{floorId: string}>()
  const [fid, setFid] = useState<string>(params.floorId || 'fa1-5')
  const floors = useFloors()
  const teams = useAllTeams()
  const floor = floors.find(f => f.floorId === fid)
  const width = window.innerWidth * .75

  return (
    <Block>
      <HeadingLarge>Lokasjoner</HeadingLarge>

      <Block display={'flex'} justifyContent={'space-between'} flexWrap>
        {floors.map((b, i) =>
          <Button key={i} onClick={() => setFid(b.floorId)} $style={{marginTop: theme.sizing.scale300}} size='mini'>{b.name}</Button>
        )}
      </Block>

      <Block display='flex'>
        {floor && <FloorPlan floor={floor} width={width} readonly
                             teams={teams}
                             locations={teams.flatMap(t => t.locations)}/>}
        {!floor && <Spinner size='64px'/>}
      </Block>

    </Block>
  )
}

export const FloorPlan = (props: {
  floor: Floor,
  width: number,
  readonly?: boolean,
  locations: Location[],
  teams?: ProductTeam[],
  highlight?: string,
  hideHeader?: boolean,
  onAdd?: (l: Location) => void, onMove?: (l: Location) => void, onDelete?: (id: string) => void
  nextId?: () => Promise<string>
}) => {
  const {floor, width, readonly} = props
  const [highlight, setHighlight] = useState(props.highlight)

  const ref = useRef<SVGSVGElement>(null)
  const [locations, setLocations] = useState<Location[]>(props.locations?.filter(l => l.floorId === floor.floorId))
  const [target, setTarget] = useState<EventTarget>()

  useEffect(() => {
    setLocations(props.locations?.filter(l => l.floorId === floor.floorId))
    setTarget(undefined)
  }, [floor, props.locations])

  const pos = (e: React.MouseEvent<SVGElement>) => {
    const CTM = ref.current!.getScreenCTM()!;
    return {
      x: Math.ceil((e.clientX - CTM.e) / CTM.a),
      y: Math.ceil((e.clientY - CTM.f) / CTM.d)
    };
  }

  const targetId = () => (target as any)?.dataset.locationCode
  const getTarget = () => {
    const id = targetId()
    return locations.find(i => i.locationCode === id)
  }

  const onDown = (e: React.MouseEvent<SVGElement>) => {
    console.log(e.target)
    if ((e.target as SVGElement).classList.contains('drag')) setTarget(e.target);
  }
  const onMove = (e: React.MouseEvent<SVGElement>) => {
    e.preventDefault()
    if (target) {
      const xy = pos(e)
      const tar = getTarget()
      if (!tar || (xy.x === tar.x && xy.y === tar.y)) return
      const other = locations.filter(i => i.locationCode !== tar.locationCode)
      const newTar = {...tar, x: xy.x, y: xy.y}
      console.log('move', newTar)
      setLocations([...other, newTar])
    }
  }
  const create = (locationCode: string, x: number, y: number) => {
    const newLoc = {floorId: floor.floorId, locationCode, x, y}
    const newIndicators = [...locations, newLoc]
    setLocations(newIndicators)
    props.onAdd && props.onAdd(newLoc)
  }
  const onUp = (e: React.MouseEvent<SVGElement>) => {
    const tar = getTarget()
    if (tar) {
      console.log('move', tar)
      props.onMove && props.onMove(tar)
      clear()
    } else {
      const xy = pos(e)
      if (props.nextId) {
        props.nextId().then((id) => create(id, xy.x, xy.y)).catch(() => console.debug('cancelled create node'))
      } else {
        const locationCode = `B${Math.ceil(Math.random() * 999)}`
        create(locationCode, xy.x, xy.y)
      }
    }
  }
  const onLeave = () => {
    if (target) {
      const id = targetId()
      setLocations(locations.filter(i => i.locationCode !== id))
      clear()
      props.onDelete && props.onDelete(id)
    }
  }
  const clear = () => setTarget(undefined)

  const teamBubbleSize = 50 * floor.bubbleScale
  const fontSize = 20 * floor.bubbleScale

  const teamFor = (id: string) => (props.teams || []).filter(t => !!t.locations.filter(l => l.floorId === floor.floorId && l.locationCode === id).length)

  return <Block display={'flex'} flexDirection={'column'}>
    {!props.hideHeader && <HeadingMedium>{floor.name}</HeadingMedium>}
    <Block>
      <Block $style={{
        backgroundImage: `url(${env.teamCatalogBaseUrl}/location/image/${floor.floorId})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain'
      }} display='flex'>
        <svg height={width * floor.dimY} width={width}
             viewBox={`0 0 1000 ${1000 * floor.dimY}`} ref={ref}

             onMouseDown={readonly ? undefined : onDown} onMouseMove={readonly ? undefined : onMove}
             onMouseUp={readonly ? undefined : onUp} onMouseLeave={readonly ? undefined : onLeave}>
          {locations.map(loc =>
            <Indicator key={loc.locationCode} id={loc.locationCode} hover={setHighlight} fontSize={fontSize} teams={teamFor(loc.locationCode)}
                       cx={loc.x} cy={loc.y} rx={teamBubbleSize} ry={teamBubbleSize} highlight={highlight === loc.locationCode}/>
          )}
        </svg>
      </Block>
    </Block>
  </Block>
}

interface IndicatorParams {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  id: string;
  highlight: boolean;
  hover: (id?: string) => void;
  fontSize: number;
  teams: ProductTeam[]
}

const Indicator = (props: IndicatorParams) => {
  const {cx, cy, rx, ry, id, fontSize, highlight, teams} = props

  const strokeWidth = 2
  const fillOpacity = .2

  const textAdjustX = rx * .5
  const textAdjustY = fontSize / 2
  return <>
    <text style={{font: `italic ${fontSize}px sans-serif`}} x={cx - textAdjustX} y={cy + textAdjustY} fill={highlight ? 'red' : 'blue'}>{id}</text>
    <StatefulTooltip content={<TeamTooltip teams={teams} locationCode={id}/>} showArrow>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} data-location-code={id} className='drag'
               stroke={highlight ? 'red' : 'black'} strokeWidth={strokeWidth} strokeDasharray={highlight ? undefined : 10}
               fill={'red'} fillOpacity={highlight ? fillOpacity : 0}
               onMouseOver={() => props.hover(id)} onMouseLeave={() => props.hover(undefined)}
      />
    </StatefulTooltip>
  </>
}


const TeamTooltip = (props: {teams: ProductTeam[], locationCode: string}) => {
  const {teams, locationCode} = props

  return (
    <Block display='flex' flexDirection='column'>
      <LabelMedium color={theme.colors.accent100}>{locationCode}</LabelMedium>
      {teams.map(t =>
        <RouteLink key={t.id} href={`/team/${t.id}`}>
          <LabelSmall color={theme.colors.accent200}>{t.name}</LabelSmall>
        </RouteLink>
      )}
    </Block>
  )
}
