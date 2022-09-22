import * as React from 'react'
import { Link } from 'react-router-dom'
import {slackRedirectUrl} from '../util/config'


export const SlackLink = (props: { channel: string }) => {
  const channels = props.channel.replace(/[#,]/g, '').split(" ").map(c => c.trim()).filter(s => !!s.length)
  const len = channels.length
  return (
    <>
      {channels.map((c, idx) =>
        <React.Fragment key={idx}>
          <Link to={slackRedirectUrl(c)} target="_blank" rel="noopener noreferrer">#{c}</Link>
          {idx < len - 1 && <span>, </span>}
        </React.Fragment>
      )}
    </>
  )
}