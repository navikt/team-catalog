import * as React from 'react'
import { Card, StyledBody } from 'baseui/card';
import { Member } from '../../../constants';
import { Paragraph2, Label2 } from 'baseui/typography';
import { Block, BlockProps } from 'baseui/block';
import User from '../../../resources/user.svg'
import { theme } from '../../../util';

const contentBlockProps: BlockProps = {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: theme.sizing.scale500
}

const TextWithLabel = (props: { label: string, text: string }) => (
    <Block display="flex" alignItems="baseline">
        <Block width="70%"><Label2 marginBottom="0">{props.label}:</Label2></Block>
        <Block width="20%"><Paragraph2 marginBottom="0">{props.text}</Paragraph2></Block>
    </Block>
)

type CardMemberProps = {
    member: Member
}

const CardMember = (props: CardMemberProps) => (
    <Card title={props.member.name} overrides={{ Root: { style: { width: '340px' } } }}>

        <StyledBody>
            <Block {...contentBlockProps}>
                <Block >
                    <TextWithLabel label="Nav-Ident" text={props.member.navIdent} />
                    <TextWithLabel label="Rolle" text={props.member.role} />
                </Block>

                <Block> <img src={User} alt="Member image" style={{ maxWidth: "100px" }} /></Block>
            </Block>
        </StyledBody>
    </Card>
);

export default CardMember