import {NodeEventHandler, ResponsiveTreeMap} from '@nivo/treemap'
import React, {useEffect, useState} from 'react'
import {useAllProductAreas, useAllTeams} from '../../api'
import {Block} from 'baseui/block'
import {theme} from '../../util'
import {Spinner} from '../common/Spinner'
import * as _ from 'lodash'

const formatTeamName = (name: string) => name.toLowerCase().startsWith("team") && name.length > 4 ? _.upperFirst(name.substr(4).trim()) : name

export const Treemap = () => {
  const teams = useAllTeams()
  const areas = useAllProductAreas()
  const [data, setData] = useState<Node>()
  const [focusPath, setFocusPath] = useState<string | undefined>()
  const [focusArea, setFocusArea] = useState(false)

  const isArea = (area: string) => focusPath?.indexOf(`NAV.${area}`) === 0
  const isTeam = (area: string, team: string) => focusPath?.indexOf(`NAV.${area}.${team}`) === 0

  useEffect(() => {
    console.log(focusArea, focusPath)
    setData({
      name: 'NAV',
      type: 'root',
      children: areas.map(a => {
        const ateams = teams.filter(t => t.productAreaId === a.id)
        return ({
          name: a.name,
          formatName: `${a.name} (${ateams.length})`,
          type: 'area',
          children: (isArea(a.name) || !focusArea ? ateams.map(t => ({
            name: t.name,
            formatName: formatTeamName(t.name),
            value: t.members.length,
            type: 'team',
            children: isTeam(a.name, t.name) ? t.members.map(m => ({
              name: m.resource.fullName || m.navIdent,
              value: 1,
              type: 'res'
            })) : []
          })) : []).filter(t => !!t.value)
        })
      }).filter(a => !!a.children.length)
    })
  }, [teams, areas, focusPath])

  return (
    <Block width='100%' height='800px'>
      {data && <Map data={data} onClick={(node) => {
        const type = (node.data as Node).type
        if (type === 'area') {
          setFocusArea(!focusArea)
        }
        const newFocus = node.path === focusPath ? undefined : node.path
        if (type == 'root' || !newFocus) setFocusArea(false)
        setFocusPath(newFocus)
      }}/>}
      {!data && <Spinner size={theme.sizing.scale800}/>}
    </Block>
  )
}

const Map = (props: {data: Node, onClick: NodeEventHandler}) => (
  <ResponsiveTreeMap
    data={props.data}
    identity='name'
    label={((node: {data: Node}) => node.data.formatName || node.data.name) as any}
    parentLabel={((node: {data: Node}) => node.data.formatName || node.data.name) as any}
    parentLabelSize={30}
    parentLabelPadding={12}
    labelSkipSize={0}
    onClick={props.onClick}
    innerPadding={5}
    outerPadding={5}
    colors={{scheme: 'paired'}}
  />
)

type Node = {
  name: string
  formatName?: string
  color?: string
  children?: Node[]
  value?: any
  type: string
}
