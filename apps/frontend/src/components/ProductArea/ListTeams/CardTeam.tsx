import * as React from 'react'
import { Card, StyledBody } from 'baseui/card';
import { ProductTeam, Resource } from '../../../constants';
import { Label2, Paragraph2 } from 'baseui/typography';
import { Block, BlockProps } from 'baseui/block';
import { theme } from '../../../util';
import { useStyletron } from 'styletron-react';
import RouteLink from '../../common/RouteLink'
import { marginAll } from '../../Style'
import { intl } from '../../../util/intl/intl'

const contentBlockProps: BlockProps = {
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  marginTop: theme.sizing.scale500
}

const TextWithLabel = (props: { label: string, text: string }) => (
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
      <Card title={props.team.name} overrides={{Root: {style: {width: '300px', ...marginAll(theme.sizing.scale200)}}}}>

        <StyledBody>
          <Block {...contentBlockProps}>
            <Block>
              {member && <TextWithLabel label="Rolle" text={member.roles.map(r=>intl[r]).join(", ")}/>}
              <TextWithLabel label="Slack" text={props.team.slackChannel}/>

              {/* <TextWithLabel label="Beskrivelse" text={props.team.description} /> */}
            </Block>

          </Block>
        </StyledBody>
      </Card>
    </RouteLink>

  )
}

export default CardTeam
