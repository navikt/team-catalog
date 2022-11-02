import * as React from "react";
import { Link } from "react-router-dom";

import { slackRedirectUrl } from "../util/config";

export const SlackLink = (properties: { channel: string }) => {
  const channels = properties.channel
    .replace(/[#,]/g, "")
    .split(" ")
    .map((c) => c.trim())
    .filter((s) => s.length > 0);
  const length_ = channels.length;
  return (
    <>
      {channels.map((c, index) => (
        <React.Fragment key={index}>
          <Link rel="noopener noreferrer" target="_blank" to={slackRedirectUrl(c)}>
            #{c}
          </Link>
          {index < length_ - 1 && <span>, </span>}
        </React.Fragment>
      ))}
    </>
  );
};
