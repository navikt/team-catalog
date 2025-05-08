import { css } from "@emotion/css";
import { Heading } from "@navikt/ds-react";
import { Link } from "react-router-dom";

export function FrontPageCard({
  title,
  icon,
  hoverIcon,
  primaryNumber,
  url,
  secondaryText,
}: {
  title: string;
  icon: string;
  hoverIcon: string;
  primaryNumber: number;
  url: string;
  secondaryText?: string;
}) {
  return (
    <Link
      className={css`
        color: var(--a-text-default);
        font-weight: var(--a-font-weight-regular);
        text-decoration: none;
        border: 4px solid #e6f1f8;
        border-radius: 15px;
        display: flex;
        white-space: nowrap;
        flex: 1;
        flex-direction: column;
        align-items: center;
        padding: 28px;

        :hover {
          background-color: #e6f1f8;
          cursor: pointer;
        }
      `}
      onMouseLeave={() => {
        (document.getElementById("img" + title) as HTMLImageElement).src = icon;
      }}
      onMouseOver={() => {
        (document.getElementById("img" + title) as HTMLImageElement).src = hoverIcon;
      }}
      to={url}
    >
      <img
        alt={""}
        className={css`
          margin-bottom: 1rem;
          width: 75px;
        `}
        id={"img" + title}
        src={icon}
      />
      <Heading level="2" size="medium" spacing>
        {primaryNumber} {title}
      </Heading>
      <span>{secondaryText ?? ""}</span>
    </Link>
  );
}
