import * as React from 'react'
import { Card, StyledBody } from 'baseui/card';
import { ProductTeam, Resource } from '../../../constants';
import { Label2, Paragraph2 } from 'baseui/typography';
import { Block } from 'baseui/block';
import { theme } from '../../../util';
import { useStyletron } from 'styletron-react';
import RouteLink from '../../common/RouteLink'
import { marginAll } from '../../Style'
import { intl } from '../../../util/intl/intl'
import { cardShadow } from '../../common/Style'

const TextWithLabel = (props: { label: string, text: string | number }) => (
  <Block display="flex" alignItems="baseline">
    <Block marginRight={theme.sizing.scale600}><Label2 marginBottom="0">{props.label}:</Label2></Block>
    <Block><Paragraph2 marginBottom="0">{props.text}</Paragraph2></Block>
  </Block>
)

type CardTeamProps = {
  team: ProductTeam
  resource?: Resource
}

const CardTeam = (props: CardTeamProps) => {
  const [useCss] = useStyletron();
  const linkCss = useCss({textDecoration: 'none'});

  const member = props.resource ? props.team.members.filter(m => m.navIdent === props.resource?.navIdent).pop() : undefined

  return (

    <RouteLink href={`/team/${props.team.id}`} className={linkCss}>
      <Card title={props.team.name} overrides={{
        Root: {style: {...cardShadow.Root.style, width: '300px', ...marginAll(theme.sizing.scale200)}},
        Contents: {style: {height: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}},
        Body: {style: {marginBottom: 0}}
      }}>
        <StyledBody>
          {member && <TextWithLabel label="Rolle" text={member.roles.map(r => intl[r]).join(", ")}/>}
          {!member && <TextWithLabel label="Medlemmer" text={props.team.members.length}/>}
        </StyledBody>
      </Card>
    </RouteLink>
  )
}

export default CardTeam
