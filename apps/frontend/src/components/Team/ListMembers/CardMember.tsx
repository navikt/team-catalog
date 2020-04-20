import * as React from 'react'
import { Card, StyledBody } from 'baseui/card';
import { Member } from '../../../constants';
import { Label2, Paragraph2 } from 'baseui/typography';
import { Block, BlockProps } from 'baseui/block';
import { theme } from '../../../util';
import { UserImage } from '../../common/UserImage'

const contentBlockProps: BlockProps = {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: theme.sizing.scale500,
}

const TextWithLabel = (props: { label: string, text: string }) => (
    <Block display="flex" alignItems="baseline">
        <Block width="100px"><Label2 marginBottom="0">{props.label}</Label2></Block>
        <Block width="100px"><Paragraph2 marginBottom="0">{props.text}</Paragraph2></Block>
    </Block>
)

export const getResourceTypeText = (text: string) => text === "INTERNAL" ? 'Intern' : 'Ekstern'

type CardMemberProps = {
    member: Member
}

const CardMember = (props: CardMemberProps) => {

    return (
        <Card title={props.member.name} overrides={{ Root: { style: { width: '450px' } } }}>

            <StyledBody>
                <Block {...contentBlockProps}>
                    <Block>
                        <TextWithLabel label="Nav-Ident" text={props.member.navIdent} />
                        <TextWithLabel label="Rolle" text={props.member.role} />
                        <TextWithLabel label="Type" text={getResourceTypeText(props.member.resourceType)} />
                        <TextWithLabel label="Epost" text={props.member.email ? props.member.email : 'Ikke registrert'} />
                    </Block>

                    <Block>
                        <UserImage ident={props.member.navIdent} maxWidth='100px'/>
                    </Block>
                </Block>
            </StyledBody>
        </Card>
    );
}

export default CardMember
