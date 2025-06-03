import * as React from "react";

import { slackRedirectUrl } from "../util/config";

export const SlackLink = (properties: { channel: string }) => {
  const channels = properties.channel
    .replaceAll(/[#,]/g, "")
    .split(" ")
    .map((c) => c.trim())
    .filter((s) => s.length > 0);
  const length_ = channels.length;
  return (
    <>
      {channels.map((c, index) => (
        <React.Fragment key={index}>
          <a
            aria-label={"Link som åpner Slack-kanalen i Slack-applikasjonen"}
            href={slackRedirectUrl(c)}
            rel="noopener noreferrer"
            target="_blank"
          >
            #{c}
          </a>
          {index < length_ - 1 && <span>, </span>}
        </React.Fragment>
      ))}
    </>
  );
};
