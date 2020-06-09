import * as React from 'react'
import { TeamMember } from '../../../constants'
import CardMember from './CardMember'
import { Block } from 'baseui/block'
import { MemberTable } from './MemberTable'

type ListMembersProps = {
  members: TeamMember[]
  table: boolean
}

const CardList = (props: ListMembersProps) => (
  <Block display='flex' flexWrap>
    {!props.table && props.members.map((member: TeamMember) => (
      <CardMember key={member.navIdent} member={member} />
    ))}
    {props.table && <MemberTable members={props.members} />}
  </Block>
)

export default CardList
