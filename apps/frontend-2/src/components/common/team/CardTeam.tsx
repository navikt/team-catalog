import { css } from "@emotion/css";
import { Heading } from "@navikt/ds-react";
import { Link } from "react-router-dom";

import greyBackgroundTeam from "../../../assets/greyBackgroundTeam.svg";
import type { ProductTeam } from "../../../constants";

const cardStyles = css`
  border: 1px solid var(--navds-global-color-deepblue-600);
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  gap: var(--navds-spacing-4);
`;

const CardTeam = (properties: { team: ProductTeam }) => (
  <div className={cardStyles}>
    <div
      className={css`
        display: flex;
        flex-direction: column;
        justify-content: center;
        white-space: nowrap;
        padding: var(--navds-spacing-4) var(--navds-spacing-6);
        gap: var(--navds-spacing-2);
      `}
    >
      <Link
        className={css`
          text-decoration: none;
        `}
        to={`/team/${properties.team.id}`}
      >
        <Heading
          className={css`
            color: var(--navds-global-color-deepblue-600);
          `}
          size="small"
        >
          {properties.team.name}
        </Heading>
      </Link>
      <span>
        Medlemmer: <b>{properties.team.members.length}</b>
      </span>
    </div>

    <img alt="greyBackgroundTeam" src={greyBackgroundTeam} />
  </div>
);

export default CardTeam;
