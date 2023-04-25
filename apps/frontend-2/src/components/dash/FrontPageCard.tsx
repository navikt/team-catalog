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
        width: 300px;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 28px;
        :hover {
          background-color: #e6f1f8;
          cursor: pointer;
        }
      `}
      onMouseLeave={() => {
        // eslint-disable-next-line unicorn/prefer-query-selector
        (document.getElementById("img" + title) as HTMLImageElement).src = icon;
      }}
      onMouseOver={() => {
        // eslint-disable-next-line unicorn/prefer-query-selector
        (document.getElementById("img" + title) as HTMLImageElement).src = hoverIcon;
      }}
      to={url}
    >
      <img
        alt={""}
        className={css`
          margin-bottom: 1.5rem;
        `}
        id={"img" + title}
        src={icon}
      />
      {/*<span*/}
      {/*  className={css`*/}
      {/*    font-size: var(--a-font-size-heading-xlarge);*/}
      {/*    font-weight: bold;*/}
      {/*    line-height: var(--a-font-line-height-heading-2xlarge);*/}
      {/*  `}*/}
      {/*>*/}
      {/*  {primaryNumber}*/}
      {/*</span>*/}
      <Heading level="2" size="medium" spacing>
        {primaryNumber} {title}
      </Heading>
      <span>{secondaryText ?? ""}</span>
    </Link>
  );
}
