import { css } from "@emotion/css";
import Slack_Monochrome_white from "../assets/Slack_Monochrome_White.svg";

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
          rel="noopener noreferrer"
          href="https://nav-it.slack.com/archives/C0362LA7ZLN"
          target="_blank"
          className={slackLink}
        >
          {/* <img src={Slack_Monochrome_white} alt="slack logo og tekst hvor det står slack" /> */}
        </a>
      </div>
    </div>
  );
};

export default Footer;
