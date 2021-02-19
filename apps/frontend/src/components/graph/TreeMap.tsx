import {ResponsiveTreeMapHtml} from '@nivo/treemap'
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

  useEffect(() => {
    setData({
      name: 'NAV',
      children: areas.map(a => ({
        name: a.name,
        children: teams.filter(t => t.productAreaId === a.id).map(t => ({
          name: t.name,
          shortName: formatTeamName(t.name),
          value: t.members.length,
          // children: t.members.map(m => ({
          //   name: m.resource.fullName || m.navIdent,
          //   value: 1
          // }))
        })).filter(t => !!t.value)
        //})).filter(t => !!t.children.length)
      })).filter(a => !!a.children.length)
    })
  }, [teams, areas])

  return (
    <Block width='100%' height='800px'>
      {data && <Map data={data}/>}
      {!data && <Spinner size={theme.sizing.scale800}/>}
    </Block>
  )
}

const Map = (props: {data: Node}) => (
  <ResponsiveTreeMapHtml
    data={props.data}
    identity='name'
    label={((node: {data: Node, value: number}) => node.data.shortName || node.data.name) as any}
    parentLabelSize={30}
    parentLabelPadding={12}
    labelSkipSize={0}
  />
)

type Node = {
  name: string
  shortName?: string
  color?: string
  children?: Node[]
  value?: any
}
