import * as React from 'react'
import {ReactNode} from 'react'
import {Card, StyledBody} from 'baseui/card';
import {Member, ResourceType} from '../../../constants';
import {Label2, Paragraph2} from 'baseui/typography';
import {Block, BlockProps} from 'baseui/block';
import {theme} from '../../../util';
import {UserImage} from '../../common/UserImage'
import {intl} from '../../../util/intl/intl'
import {StatefulTooltip} from 'baseui/tooltip'
import {marginAll} from '../../Style'
import RouteLink from '../../common/RouteLink'
import {cardShadow} from '../../common/Style'
import moment from 'moment'

const contentBlockProps: BlockProps = {
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  marginTop: theme.sizing.scale500,
}

const TextWithLabel = (props: {label: string, text: ReactNode, tooltip?: string}) => (
  <Block display="flex" alignItems="baseline">
    <Block flex='0 0 100px'><Label2 marginBottom="0">{props.label}</Label2></Block>
    <Block flex={1}><Paragraph2 marginBottom="0">{props.text}</Paragraph2></Block>
  </Block>
)

type CardMemberProps = {
  member: Member
}

const resourceTypeNote = (resourceType?: ResourceType) => {
  switch (resourceType) {
    case ResourceType.EXTERNAL:
      return `(${intl.EXTERNAL})`;
    case ResourceType.OTHER:
      return `(${intl.nonNavEmployee})`;
    default:
      return ''
  }
}

const CardMember = (props: CardMemberProps) => {
  const {member} = props
  return (
    <Card
      title={member.resource.fullName ? <StatefulTooltip content={`Nav-Ident: ${member.navIdent}`}>
          <div>
            <RouteLink href={`/resource/${member.navIdent}`} hideUnderline>
              {member.resource.fullName} {resourceTypeNote(member.resource.resourceType)} {member.resource.endDate && moment(member.resource.endDate).isBefore(moment()) && '(Inaktiv)'}
            </RouteLink>
          </div>
        </StatefulTooltip> :
        <Block>
          Personen er ikke funnet i NOM ({member.navIdent})
        </Block>
      }
      overrides={{
        Root:
          {
            style:
              {
                ...cardShadow.Root.style,
                width: '450px',
                ...marginAll(theme.sizing.scale200),
                backgroundColor: member.resource.fullName ? "" : "#FBEFEE"
              }
          }
      }}>

      <StyledBody>
        <Block  {...contentBlockProps}>
          <Block flex={1}>
            <TextWithLabel label="Roller" text={member.roles.map(r => intl[r]).join(", ")}/>
            {member.description && <TextWithLabel label="Annet" text={member.description}/>}
          </Block>

          <UserImage ident={member.navIdent} size='100px'/>
        </Block>
        <TextWithLabel label="Epost" text={member.resource.email || 'Ikke registrert'}/>
      </StyledBody>
    </Card>
  );
}

export default CardMember
