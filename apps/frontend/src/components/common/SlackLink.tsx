import { StyledLink } from 'baseui/link'
import * as React from 'react'

const slackTeamId = `T5LNAMWNA`

export const SlackLink = (props: { channel: string }) => {
    const channels = props.channel.replace(/#/g, '').split(",").map(c => c.trim())
    return (
        <>
            {channels.map((c, idx) =>
                <>
                    <StyledLink key={idx} href={`https://slack.com/app_redirect?team=${slackTeamId}&channel=${c}`}
                                target="_blank" rel="noopener noreferrer">
                        #{c}
                    </StyledLink>
                    <span> </span>
                </>
            )}
        </>
    )
}
