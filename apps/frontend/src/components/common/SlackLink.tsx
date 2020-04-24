import { StyledLink } from 'baseui/link'
import * as React from 'react'

const slackTeamId = `T5LNAMWNA`

export const SlackLink = (props: { channel: string }) => {
  const channel = props.channel.indexOf('#') === 0 ? props.channel.substr(1) : props.channel
  return (
    <StyledLink href={`https://slack.com/app_redirect?team=${slackTeamId}&channel=${channel}`}
                target="_blank" rel="noopener noreferrer">
      {props.channel}
    </StyledLink>
  )
}
