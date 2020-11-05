import {Member, ResourceType} from '../../constants'
import {Block} from 'baseui/block'
import {Label1, Label2, Paragraph2} from 'baseui/typography'
import {theme} from '../../util'
import Button from '../common/Button'
import {faIdCard, faTable} from '@fortawesome/free-solid-svg-icons'
import ListMembers from './ListMembers'
import * as React from 'react'
import {MemberExport} from './MemberExport'


export const Members = (props: {members: Member[], title: string, defaultTable?: boolean, teamId?: string, productAreaId?: string, clusterId?: string}) => {
  const [table, setTable] = React.useState(!!props.defaultTable)
  const {members} = props

  let external = members.filter(m => m.resource.resourceType === ResourceType.EXTERNAL).length
  let membersCount = members.length

  return (
    <Block>
      <Block width='100%' display='flex' justifyContent='space-between'>
        <Label1 marginBottom={theme.sizing.scale800}>
          {props.title} ({membersCount})
        </Label1>
        <Label2>Ekstern: {external} ({external > 0 ? (external / membersCount * 100).toFixed(0) : "0"}%)</Label2>
        <Block>
          <MemberExport productAreaId={props.productAreaId} teamId={props.teamId} clusterId={props.clusterId}/>
          <Button tooltip='Skift visningmodus' icon={table ? faIdCard : faTable} kind='outline' size='compact' onClick={() => setTable(!table)}>
            {table ? 'Kort' : 'Tabell'}
          </Button>
        </Block>
      </Block>
      {members.length > 0 ?
        <ListMembers members={members} table={table}/>
        : <Paragraph2>Ingen medlemmer registrert</Paragraph2>}
    </Block>
  )
}
