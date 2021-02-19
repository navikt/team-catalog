import {ResponsiveTreeMap} from '@nivo/treemap'
import React, {useEffect, useState} from 'react'
import {useAllProductAreas, useAllTeams} from '../../api'
import {Block} from 'baseui/block'
import {theme} from '../../util'


export const Treemap = () => {
  const teams = useAllTeams()
  const areas = useAllProductAreas()
  const [data, setData] = useState<Node>()

  useEffect(() => {
    setData({
      name: 'NAV',
      color: theme.colors.primary100,
      children: areas.map(a => ({
        name: a.name,
        color: theme.colors.positive100,
        children: teams.filter(t => t.productAreaId === a.id).map(t => ({
          name: t.name,
          children: t.members.map(m => ({
            name: m.resource.fullName || m.navIdent,
            color: theme.colors.warning100,
            value: 1
          }))
        })).filter(t => !!t.children.length)
      })).filter(a => !!a.children.length)
    })
  }, [teams, areas])

  console.log(data)

  return (
    <Block width='100%' height='800px'>
      <ResponsiveTreeMap
        data={data}
        identity='name'
        label='id'
        parentLabelSize={30}
        parentLabelPadding={12}
        labelSkipSize={0}
        labelTextColor={{from: 'color', modifiers: [['darker', 1.2]]}}
        parentLabelTextColor={{from: 'color', modifiers: [['darker', 2]]}}
        borderColor={{from: 'color', modifiers: [['darker', 0.1]]}}/>
    </Block>
  )
}

type Node = {
  name: string
  color?: string
  children?: Node[]
  value?: any
}
