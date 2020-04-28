import * as React from 'react'
import { ProductTeam, Resource } from '../../../constants'
import CardTeam from './CardTeam'
import { Block } from 'baseui/block'

type ListMembersProps = {
  teams: ProductTeam[]
  resource?: Resource
}

const CardList = (props: ListMembersProps) => (
  <Block
    display='flex'
    flexWrap
  >
    {props.teams.map((team: ProductTeam) => (
      <CardTeam key={team.id} team={team} resource={props.resource}/>
    ))}

  </Block>
)

export default CardList
