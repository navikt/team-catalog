import * as React from 'react'
import { Card, StyledBody } from 'baseui/card';
import { ProductTeam } from '../../../constants';
import { Paragraph2, Label2 } from 'baseui/typography';
import { Block, BlockProps } from 'baseui/block';
import { theme } from '../../../util';
import { StyledLink } from 'baseui/link';
import { useStyletron } from 'styletron-react';

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
}

const CardTeam = (props: CardTeamProps) => {
    const [useCss] = useStyletron();
    const linkCss = useCss({ textDecoration: 'none' });

    return (

        <StyledLink href={`/team/${props.team.id}`} className={linkCss}>
            <Card title={props.team.name} overrides={{ Root: { style: { width: '340px' } } }}>

                <StyledBody>
                    <Block {...contentBlockProps}>
                        <Block >
                            <TextWithLabel label="Slack" text={props.team.slackChannel} />

                            {/* <TextWithLabel label="Beskrivelse" text={props.team.description} /> */}
                        </Block>

                    </Block>
                </StyledBody>
            </Card>
        </StyledLink>

    )
}

export default CardTeam