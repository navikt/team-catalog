import * as React from 'react'
import { ProductTeam } from '../../../constants'
import CardTeam from './CardTeam'
import { Block } from 'baseui/block'

type ListMembersProps = {
  teams: ProductTeam[]
}

const CardList = (props: ListMembersProps) => (
  <Block
    display='flex'
    flexWrap
  >
    {props.teams.map((team: ProductTeam) => (
      <CardTeam key={team.id} team={team}/>
    ))}

  </Block>
)

export default CardList
