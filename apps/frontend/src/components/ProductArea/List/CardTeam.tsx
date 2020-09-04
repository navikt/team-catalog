import * as React from 'react'
import {Card, StyledBody} from 'baseui/card';
import {ProductTeam, Resource} from '../../../constants';
import {Label2, Paragraph2} from 'baseui/typography';
import {Block, BlockProps} from 'baseui/block';
import {theme} from '../../../util';
import RouteLink from '../../common/RouteLink'
import {marginAll} from '../../Style'
import {cardShadow} from '../../common/Style'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUsers} from "@fortawesome/free-solid-svg-icons";
import {intl} from "../../../util/intl/intl";

type CardTeamProps = {
  team: ProductTeam
  resource?: Resource
}

const contentBlockProps: BlockProps = {
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  marginTop: theme.sizing.scale500,
}

const TextWithLabel = (props: {label: string, text: string | number}) => (
  <Block display="flex" alignItems="baseline">
    <Block marginRight={theme.sizing.scale600}><Label2 marginBottom="0">{props.label}:</Label2></Block>
    <Block><Paragraph2 marginBottom="0">{props.text}</Paragraph2></Block>
  </Block>
)

const CardTeam = (props: CardTeamProps) => {
  const member = props.resource ? props.team.members.filter(m => m.navIdent === props.resource?.navIdent).pop() : undefined
  return (

    <Card
      title={<RouteLink href={`/team/${props.team.id}`} hideUnderline>{props.team.name}</RouteLink>}
      overrides={{
        Root: {
          style: {
            ...cardShadow.Root.style,
            width: '450px',
            ...marginAll(theme.sizing.scale200),
          }
        },
        Body: {
          style: {
            marginBottom: 0
          }
        },
        Title: {
          style: {
            marginBottom: 0
          }
        }
      }}>
      <StyledBody>
        <Block  {...contentBlockProps}>
          <Block flex={1}>
            {member && <TextWithLabel
              label="Roller"
              text={member?.roles.map(role => intl.getString(role)).join(", ") || ''}
            />}
            <TextWithLabel label="Medlemmer" text={props.team.members.length}/>
          </Block>
          <Block flex='0 0 50px'>
            <FontAwesomeIcon icon={faUsers} size='2x' color={theme.colors.accent300}/>
          </Block>
        </Block>
      </StyledBody>
    </Card>
  )
}

export default CardTeam
