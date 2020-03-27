import * as React from 'react'
import { H4, Label2, Paragraph2, Label1 } from 'baseui/typography'
import { Block } from 'baseui/block'
import { theme } from '../../util'
import { DotTags } from './DotTag'

const TextWithLabel = (props: { label: string, text: string }) => (
    <Block marginTop={theme.sizing.scale600}>
        <Label2>{props.label}</Label2>
        <Paragraph2>{props.text}</Paragraph2>
    </Block>
)

const NaisTeamsList = (props: { label: string, list: string[] }) => (
    <Block marginTop={theme.sizing.scale600}>
        <Label2>{props.label}</Label2>
        <Paragraph2><DotTags items={props.list} /> </Paragraph2>
    </Block>
)

type MetadataProps = {
    description: string;
    productAreaName?: string;
    slackChannel?: string;
    naisTeams?: string[]
}

const Metadata = (props: MetadataProps) => {
    const { description, productAreaName, slackChannel, naisTeams } = props

    return (
        <>
            <Block display="flex">
                <Block width="50%">
                    {productAreaName && <TextWithLabel label="Produktområde" text={productAreaName} />}
                    <TextWithLabel label="Beskrivelse" text={description} />
                </Block>

                <Block display={slackChannel || naisTeams ? 'block' : 'none'} marginTop="0" paddingLeft={theme.sizing.scale800} $style={{ borderLeft: `1px solid ${theme.colors.mono600}` }}>
                    <TextWithLabel label="Slack" text={!slackChannel ? 'Fant ikke slack kanal' : slackChannel} />
                    <NaisTeamsList label="Teams på NAIS" list={!naisTeams ? [] : naisTeams} />
                </Block>

            </Block>
        </>
    )
}

export default Metadata
