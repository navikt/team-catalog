import {NodeEventHandler, ResponsiveTreeMap, TreeMapNodeDatum, TreeMapSvgProps} from '@nivo/treemap'
import React, {Component, useEffect, useState} from 'react'
import {useAllProductAreas, useAllTeams} from '../../api'
import {Block} from 'baseui/block'
import {theme} from '../../util'
import {Spinner} from '../common/Spinner'
import * as _ from 'lodash'
import randomColor from 'randomcolor'
import {ProductTeam, TeamRole} from '../../constants'
import {LabelMedium, LabelSmall} from 'baseui/typography'
import {intl} from '../../util/intl/intl'
import {ObjectType} from '../admin/audit/AuditTypes'
import {useHistory} from 'react-router-dom'
import {urlForObject} from '../common/RouteLink'

const formatTeamName = (name: string) => name.toLowerCase().startsWith("team") && name.length > 4 ? _.upperFirst(name.substr(4).trim()) : name

const colors = Object.values(TeamRole)
.reduce((val, id) => {
  val[id] = randomColor({seed: id,})
  return val
}, {} as {[id: string]: string})

export const Treemap = () => {
  const teams = useAllTeams()
  const areas = useAllProductAreas()
  const [data, setData] = useState<Node>()
  const [focusPath, setFocusPath] = useState<string | undefined>()
  const history = useHistory()

  const isArea = (area: string) => focusPath?.indexOf(`NAV.${area}`) === 0
  const isTeam = (area: string, team: string) => focusPath?.indexOf(`NAV.${area}.${team}`) === 0

  useEffect(() => {
    const mapArea = (areaId: string, areaName: string, ateams: ProductTeam[]): Node => {
      return ({
        id: areaId,
        name: areaName,
        formatName: `${areaName} (${ateams.length})`,
        type: ObjectType.ProductArea,
        children: (!focusPath || isArea(areaId) ? ateams.map(t => ({
          id: t.id,
          name: t.name,
          formatName: formatTeamName(t.name),
          members: t.members.length,
          value: isTeam(areaId, t.id) ? .0000001 : t.members.length, // if expanded value takes up space not allocated to members
          type: ObjectType.Team,
          children: isTeam(areaId, t.id) ? t.members.map(m => ({
            id: m.navIdent,
            name: m.resource.fullName || m.navIdent,
            value: 1,
            type: ObjectType.Resource,
            roles: m.roles
          })) : []
        })) : []).filter(t => !!t.value)
      })
    }

    setData({
      id: 'NAV',
      name: 'NAV',
      type: 'root',
      children: [
        ...areas.map(a => mapArea(a.id, a.name, teams.filter(t => t.productAreaId === a.id))),
        mapArea('noid', "Ingen område", teams.filter(t => !t.productAreaId))
      ].filter(a => !!a.children!.length)
    })
  }, [teams, areas, focusPath])

  return (
    <Block display='flex' width='100%' flexDirection='column'>
      <Block marginBottom={theme.sizing.scale600}>
        <LabelSmall>Trykk på område for å se kun området. Trykk på team for å se medlemmer. Ctrl/Cmd klikk for å gå til område/team/person</LabelSmall>
      </Block>
      <Block width='100%' height='85vh'>
        {data && <Map data={data} onClick={(node, event) => {
          const dataNode = node.data as Node
          setFocusPath(dataNode.type === 'root' || isArea(dataNode.id) ? undefined : node.path)
          if ((event.ctrlKey || event.metaKey) && dataNode.type !== 'root') history.push(urlForObject(dataNode.type, dataNode.id))
        }}/>}
        {!data && <Spinner size={theme.sizing.scale800}/>}
      </Block>
    </Block>
  )
}

function withTooltip<T>(WrappedComponent: any) {
  return class extends Component<Tooltip & T> {
    public render() {
      return <WrappedComponent {...this.props} />;
    }
  };
}

const Tree = withTooltip<TreeMapSvgProps>(ResponsiveTreeMap)

const Map = (props: {data: Node, onClick: NodeEventHandler}) => (
  <Tree
    data={props.data}
    label={((node: {data: Node}) => node.data.formatName || node.data.name) as any}
    parentLabel={((node: {data: Node}) => node.data.formatName || node.data.name) as any}
    parentLabelSize={30}
    parentLabelPadding={12}
    labelSkipSize={0}
    onClick={props.onClick}
    innerPadding={5}
    outerPadding={5}
    colors={{scheme: 'paired'}}
    labelTextColor={node => {
      const data = node.data as Node
      if (data.type === ObjectType.Resource) {
        return colors[data.roles![0]]
      }
      return node.borderColor
    }}
    tooltip={d => {
      const data = d.node.data as Node
      // counteract .000001
      if (data.type !== ObjectType.Resource)
        return <LabelMedium>{data.name} ({Math.floor(d.node.value)})</LabelMedium>
      return <LabelMedium>{data.name}: {data.roles!.map((r: TeamRole) => intl[r]).join(', ')}</LabelMedium>
    }}
  />
)

type Node = {
  id: string
  name: string
  formatName?: string
  color?: string
  children?: Node[]
  value?: any
  type: ObjectType | 'root'
  roles?: TeamRole[]
}

type Tooltip = {
  tooltip: (d: {node: TreeMapNodeDatum}) => React.ReactNode
}
