import { css } from "@emotion/css";

import gitLogo from "../assets/git.svg";
import slackIcon from "../assets/slackWhite.svg";
import { appSlackLink, documentationLink } from "../util/config";
import NavItem from "./header/NavItem";

export const footerHeigth = "5rem";

const outerDiv = css({
  width: "100%",
  bottom: "0",
  height: footerHeigth,
  background: "var(--a-deepblue-600)",
});

const innerDiv = css({
  height: "100%",
  width: "100%",
  margin: "0 auto",
  display: "flex",
  gap: "1rem",
  justifyContent: "center",
  alignItems: "center",
  color: "var(--a-white)",
  textAlign: "center",
});

const Footer = () => {
  return (
    <div className={outerDiv}>
      <div className={innerDiv}>
        <div
          className={css`
            display: flex;
            align-items: center;
            gap: 0.5rem;
          `}
        >
          <img
            alt={"Github"}
            className={css`
              width: 32px;
              height: 32px;
            `}
            src={gitLogo}
          />
          <NavItem clientSide={false} external label="Dokumentasjon" url={documentationLink} />
        </div>

        <div
          className={css`
            display: flex;
            align-items: center;
            gap: 0.5rem;
          `}
        >
          <img
            alt="Slack"
            className={css`
              width: 32px;
              height: 32px;
            `}
            src={slackIcon}
          />
          <NavItem clientSide={false} external label="#teamkatalogen" url={appSlackLink} />
        </div>
      </div>
    </div>
  );
};

export default Footer;
