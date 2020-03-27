import * as React from 'react'
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'
import { Member } from '../../constants'
import CardMember from './CardMember'

type ListMembersProps = {
    members: Member[]
}

const ListMembers = (props: ListMembersProps) => (
    <FlexGrid
        flexGridColumnCount={4}
        flexGridColumnGap="scale800"
        flexGridRowGap="scale800"
    >
        {props.members.map((member: Member) => (
            <FlexGridItem key={member.navIdent}><CardMember member={member} /></FlexGridItem>
        ))}

    </FlexGrid>
)

export default ListMembers