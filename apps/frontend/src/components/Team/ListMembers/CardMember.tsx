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
    marginTop: theme.sizing.scale500,
}

const TextWithLabel = (props: { label: string, text: string }) => (
    <Block display="flex" alignItems="baseline">
        <Block width="100px"><Label2 marginBottom="0">{props.label}</Label2></Block>
        <Block width="100px"><Paragraph2 marginBottom="0">{props.text}</Paragraph2></Block>
    </Block>
)

const getResourceTypeText = (text: string) => text === "INTERNAL" ? 'Intern' : 'Ekstern'
const getResourceImage = (navIdent: string) => `https://teamkatalog-api.nais.adeo.no/resource/${navIdent}/photo`


type CardMemberProps = {
    member: Member
}

const CardMember = (props: CardMemberProps) => {
    const [image, setImage] = React.useState(getResourceImage(props.member.navIdent))

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
                        <img
                            src={image}
                            onError={() => setImage(User)}
                            alt="Member image"
                            style={{ maxWidth: "100px" }}
                        />
                    </Block>
                </Block>
            </StyledBody>
        </Card>
    );
}

export default CardMember