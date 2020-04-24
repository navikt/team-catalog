import * as React from 'react'
import { Member } from '../../../constants'
import CardMember from './CardMember'
import { Block } from 'baseui/block'

type ListMembersProps = {
    members: Member[]
}

const CardList = (props: ListMembersProps) => (
    <Block
        display='flex' flexWrap
    >
        {props.members.map((member: Member) => (
            <CardMember member={member} />
        ))}

    </Block>
)

export default CardList
