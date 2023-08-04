import { css } from "@emotion/css";

import gitLogo from "../assets/git.svg";
import slackIcon from "../assets/slackWhite.svg";
import { appSlackLink, documentationLink } from "../util/config";
import { NavItem } from "./header/NavItem";

export const footerHeight = "7rem";

export const Footer = () => {
  return (
    <div
      className={css`
        display: flex;
        justify-content: center;
        background: var(--a-deepblue-600);
        margin-top: var(--a-spacing-8);
        height: 5rem;
      `}
    >
      <div
        className={css`
          display: flex;
          align-items: center;
          gap: var(--a-spacing-8);
        `}
      >
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
