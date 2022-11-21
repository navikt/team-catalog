import { css } from "@emotion/css";

import documentation from "../assets/documentation.svg";
import Slack_Monochrome_white from "../assets/Slack_Monochrome_White.svg";
import { appSlackLink, documentationLink } from "../util/config";

export const footerHeigth = "5rem";

const outerDiv = css({
  width: "100%",
  bottom: "0",
  height: footerHeigth,
  background: "var(--navds-global-color-deepblue-600)",
});

const innerDiv = css({
  height: "100%",
  width: "100%",
  margin: "0 auto",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: "var(--navds-global-color-white)",
  textAlign: "center",
});

const slackLink = css({
  marginLeft: "3rem",
  width: "100%",
});

const Footer = () => {
  return (
    <div className={outerDiv}>
      <div className={innerDiv}>
        <a
          className={css`
            margin-right: 3rem;
          `}
          href={documentationLink}
          rel="noopener noreferrer"
          target="_blank"
        >
          <img src={documentation} />
        </a>

        <a href={appSlackLink} rel="noopener noreferrer" target="_blank">
          <img alt="slack logo og tekst hvor det står slack" src={Slack_Monochrome_white} />
        </a>
      </div>
    </div>
  );
};

export default Footer;
