import * as React from 'react'
import { ProductArea, ProductTeam, Resource } from '../../../constants'
import CardTeam from './CardTeam'
import CardProductArea from './CardProductArea'
import { Block } from 'baseui/block'

type ListMembersProps = {
  teams: ProductTeam[]
  productAreas?: ProductArea[]
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
    {props.productAreas?.map((pa: ProductArea) => (
      <CardProductArea key={pa.id} productArea={pa} resource={props.resource}/>
    ))}

  </Block>
)

export default CardList
