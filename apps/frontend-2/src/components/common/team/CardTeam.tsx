import { css } from "@emotion/css";
import { Heading } from "@navikt/ds-react";
import { Link } from "react-router-dom";

import greyBackground from "../../../assets/greyBackgroundTeam.svg";
import type { ProductTeam } from "../../../constants";
// import teamCardIcon from '../../assets/teamCardIcon.svg'

const cardStyles = css`
  height: 98px;
  width: 435px;
  border: 1px solid #005077;
  border-radius: 4px;
  display: grid;
  grid-template-columns: 1fr 0.3fr;
  margin-bottom: 1rem;
`;
const headingStyles = css`
  font-family: "Inter";
  font-style: normal;
  font-weight: 600;
  font-size: 22px;
  line-height: 24px;
  color: #005077;
  margin-top: 1rem;
`;

const CardTeam = (properties: { team: ProductTeam }) => (
  <div className={cardStyles}>
    <div
      className={css`
        height: 100%;
        padding-left: 20px;
      `}
    >
      <Link
        className={css`
          text-decoration: none;
        `}
        to={`/team/${properties.team.id}`}
      >
        <Heading className={headingStyles} size="medium">
          {properties.team.name}
        </Heading>
      </Link>
      <div
        className={css`
          margin-top: 1.1rem;
        `}
      >
        <div
          className={css`
            margin-bottom: 3px;
          `}
        >
          Medlemmer: <b>{properties.team.members.length}</b>
        </div>
      </div>
    </div>

    <div
      className={css`
        position: relative;
      `}
    >
      <img
        className={css`
          z-index: -1;
        `}
        src={greyBackground}
      />
    </div>
  </div>
);

export default CardTeam;
