import * as React from 'react'
import { ReactNode } from 'react'
import { Card, StyledBody } from 'baseui/card';
import { Member, ResourceType } from '../../../constants';
import { Label2, Paragraph2 } from 'baseui/typography';
import { Block, BlockProps } from 'baseui/block';
import { theme } from '../../../util';
import { UserImage } from '../../common/UserImage'
import { intl } from '../../../util/intl/intl'
import { StatefulTooltip } from 'baseui/tooltip'
import { marginAll } from '../../Style'

const contentBlockProps: BlockProps = {
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  marginTop: theme.sizing.scale500,
}

const TextWithLabel = (props: { label: string, text: ReactNode, tooltip?: string }) => (
  <Block display="flex" alignItems="baseline">
    <Block flex='0 0 100px'><Label2 marginBottom="0">{props.label}</Label2></Block>
    <Block flex={1}><Paragraph2 marginBottom="0">{props.text}</Paragraph2></Block>
  </Block>
)

type CardMemberProps = {
  member: Member
}

const CardMember = (props: CardMemberProps) => {

  return (
    <Card title={
      <StatefulTooltip content={`Nav-Ident: ${props.member.navIdent}`}>
        <span>{props.member.name} {props.member.resourceType === ResourceType.EXTERNAL ? `(${intl.EXTERNAL})` : ''}</span>
      </StatefulTooltip>
    } overrides={{Root: {style: {width: '450px', ...marginAll(theme.sizing.scale200)}}}}>

      <StyledBody>
        <Block  {...contentBlockProps}>
          <Block flex={1}>
            <TextWithLabel label="Roller" text={props.member.roles.map(r => intl[r]).join(", ")}/>
            {props.member.description && <TextWithLabel label="Annet" text={props.member.description}/>}
          </Block>

          <Block flex='0 0 100px'>
            <UserImage ident={props.member.navIdent} maxWidth='100px'/>
          </Block>
        </Block>
        <TextWithLabel label="Epost" text={props.member.email ? props.member.email : 'Ikke registrert'}/>
      </StyledBody>
    </Card>
  );
}

export default CardMember
