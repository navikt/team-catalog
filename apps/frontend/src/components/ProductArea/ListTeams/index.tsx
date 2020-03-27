import * as React from 'react'
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'
import { Member, ProductTeam } from '../../../constants'
import CardTeam from './CardTeam'

type ListMembersProps = {
    teams: ProductTeam[]
}

const CardList = (props: ListMembersProps) => (
    <FlexGrid
        flexGridColumnCount={4}
        flexGridColumnGap="scale800"
        flexGridRowGap="scale800"
    >
        {props.teams.map((team: ProductTeam) => (
            <FlexGridItem key={team.id}><CardTeam team={team} /></FlexGridItem>
        ))}

    </FlexGrid>
)

export default CardList