import {ResponsiveTreeMapHtml} from '@nivo/treemap'
import React, {useEffect, useState} from 'react'
import {useAllProductAreas, useAllTeams} from '../../api'
import {Block} from 'baseui/block'
import {theme} from '../../util'
import {Spinner} from '../common/Spinner'


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
          value:t.members.length,
          // children: t.members.map(m => ({
          //   name: m.resource.fullName || m.navIdent,
          //   value: 1
          // }))
        })).filter(t => !!t.value)
        //})).filter(t => !!t.children.length)
      })).filter(a => !!a.children.length)
    })
  }, [teams, areas])

  console.log(data)

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
    label='id'
    parentLabelSize={30}
    parentLabelPadding={12}
    labelSkipSize={0}
  />
)

type Node = {
  name: string
  color?: string
  children?: Node[]
  value?: any
}
