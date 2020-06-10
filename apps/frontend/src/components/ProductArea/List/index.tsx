import * as React from 'react'
import { ProductArea, ProductTeam, Resource } from '../../../constants'
import CardTeam from './CardTeam'
import CardProductArea from './CardProductArea'
import { Block } from 'baseui/block'
import { Label1, Paragraph2 } from 'baseui/typography'
import { theme } from '../../../util'

type ListMembersProps = {
  teams?: ProductTeam[]
  productAreas?: ProductArea[]
  resource?: Resource
}

const CardList = (props: ListMembersProps) => (
  <>
    {props.teams &&
    <Block>
      <Label1 marginBottom={theme.sizing.scale800}>Teams ({props.teams.length})</Label1>
      {props.teams.length ?
        <Block
          display='flex'
          flexWrap
        >
          {props.teams.map((team: ProductTeam) => (
            <CardTeam key={team.id} team={team} resource={props.resource}/>
          ))}
        </Block>
        : <Paragraph2>Ingen teams</Paragraph2>}
    </Block>}

    {props.productAreas &&
    <Block marginTop={theme.sizing.scale1200}>
      <Label1 marginBottom={theme.sizing.scale800}>Områder ({props.productAreas.length})</Label1>
      {props.productAreas.length ?
        <Block
          display='flex'
          flexWrap
        >
          {props.productAreas?.map((pa: ProductArea) => (
            <CardProductArea key={pa.id} productArea={pa} resource={props.resource}/>
          ))}
        </Block>
        : <Paragraph2>Ingen områder</Paragraph2>}
    </Block>}
  </>
)

export default CardList
