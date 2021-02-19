import React, {useEffect, useState} from 'react'
import {Block} from 'baseui/block'
import axios from 'axios'
import {env} from '../util/env'
import * as queryString from 'query-string'
import moment, {HTML5_FMT, Moment} from 'moment'
import {HeadingSmall} from 'baseui/typography'
import {theme} from '../util'
import {ResponsiveLine, Serie} from '@nivo/line'
import {PageResponse} from '../constants'
import {intl} from '../util/intl/intl'
import {Tab, Tabs} from 'baseui/tabs'
import {NotificationType} from '../services/Notifications'

export enum TargetType {
  TEAM = "TEAM",
  AREA = "AREA"
}

interface ChangelogType {
  created: Item[]
  deleted: Item[]
  updated: (UpdateTeam | UpdateArea)[]
}

interface Item {
  type: TargetType
  id: string
  name: string
  deleted?: boolean
}

interface Changeable {
  target: Item

  oldName: string
  newName: string
  oldType: string
  newType: string

  removedMembers: Resource[]
  addedMembers: Resource[]
}

interface UpdateTeam extends Changeable {
  oldArea?: Item
  newArea?: Item
}

interface UpdateArea extends Changeable {
  removedTeams: Item[]
  addedTeams: Item[]
}

interface Resource {
  ident: string
  name: string
}

type ClProps = {
  days: number
}

const formatSerie = (data: ChangelogType[], labels: string[], type: TargetType) => {
  return [
    {
      id: 'Fjernet medlem',
      data: data.map((c, i) => ({
        x: labels[i],
        y: c.updated.filter(o => o.target.type === type).reduce((p, c) => p + c.removedMembers.length, 0) || 0
      }))
    }, {
      id: 'Lagt til medlem',
      data: data.map((c, i) => ({
        x: labels[i],
        y: c.updated.filter(o => o.target.type === type).reduce((p, c) => p + c.addedMembers.length, 0) || 0
      }))
    }, {
      id: 'Oppdatert',
      data: data.map((c, i) => ({
        x: labels[i],
        y: c.updated.filter(o => o.target.type === type).length || 0
      }))
    }, {
      id: 'Fjernet',
      data: data.map((c, i) => ({
        x: labels[i],
        y: c.deleted.filter(o => o.type === type).length || 0
      }))
    }, {
      id: 'Nytt',
      data: data.map((c, i) => ({
        x: labels[i],
        y: c.created.filter(o => o.type === type).length || 0
      }))
    }
  ]
}

const format = 'MMM DD'

export const Changelog = (props: ClProps) => {
  const [type, setType] = useState(TargetType.TEAM)
  const [changelog, setChangelog] = useState<ChangelogType[]>([])
  const [data, setData] = useState<Serie[]>([])
  const types = Object.values(TargetType)

  useEffect(() => {
    const start = moment().subtract(props.days, 'day')
    getChangelog(NotificationType.ALL_EVENTS, start, moment()).then(r => {
      setChangelog(r.content)
    })
  }, [props.days])

  useEffect(() => {
    const start = moment().subtract(props.days, 'day')
    const labels = changelog.map((_, i) => {
      const l = start.format(format)
      start.add(1, 'day')
      return l
    })
    const cl = formatSerie(changelog, labels, type)
    setData(cl)
  }, [changelog, type])

  return (
    <Block marginTop={theme.sizing.scale400} width={'100%'}>
      <Block>
        <Block display='flex' justifyContent='space-between'>
          <HeadingSmall>Handlinger siste {props.days} dager for {intl[type]}</HeadingSmall>
          <Block alignSelf='flex-end'>
            <Tabs
              onChange={({activeKey}) => {
                setType(activeKey as TargetType)
              }}
              activeKey={type}>
              {types.map(t => <Tab key={t} title={intl[t]} id={t}/>)}
            </Tabs>
          </Block>
        </Block>
        <Block width={'100%'} height={theme.sizing.scale4800}>
          <Graph data={data}/>
        </Block>
      </Block>
    </Block>
  )
}

const Graph = (props: {data: Serie[]}) => {
  console.log(JSON.stringify(props.data ))
  return (
    <ResponsiveLine
      data={props.data}
      margin={{top: 20, right: 120, bottom: 40, left: 30}}
      yScale={{type: 'linear', min: 0, max: 'auto'}}
      colors={{scheme: 'category10'}}
      curve={'catmullRom'}
      enableSlices='x'

      axisBottom={{tickRotation: 35}}
      pointSize={6}
      pointBorderWidth={3}
      useMesh
      animate

      legends={[{
        anchor: 'bottom-right',
        direction: 'column',
        translateX: 100,
        itemWidth: 80,
        itemHeight: 20,
        itemOpacity: 0.75,
        symbolSize: 12,
        symbolShape: 'circle',
        symbolBorderColor: 'rgba(0, 0, 0, .5)',
        effects: [
          {
            on: 'hover',
            style: {
              itemBackground: 'rgba(0, 0, 0, .03)',
              itemOpacity: 1
            }
          }
        ]
      }
      ]}
    />
  )
}

const getChangelog = async (type: NotificationType, start: Moment, end: Moment, targetId?: string) => {
  const params = {
    type,
    targetId,
    start: start.format(HTML5_FMT.DATE),
    end: end.format(HTML5_FMT.DATE)
  }
  return (await axios.get<PageResponse<ChangelogType>>(`${env.teamCatalogBaseUrl}/notification/changelog/day?${queryString.stringify(params, {skipNull: true})}`)).data
}
