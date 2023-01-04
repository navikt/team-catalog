import { css } from "@emotion/css";
import { Heading } from "@navikt/ds-react";
import { Link } from "react-router-dom";

import teamCardIconCircle from "../../assets/teamCardIconCircle.svg";
import teamCardResourceCircle from "../../assets/teamCardResourceCircle.svg";
import { linkCardStyle } from "../../util/styles";

const iconWithTextStyle = css`
  display: flex;
  gap: 0.5rem;
  flex-direction: row;
  align-items: center;
`;

const AccordianResourceCard = ({
  name,
  numberOfTeams,
  numberOfMembers,
  url,
  color,
}: {
  name: string;
  url: string;
  numberOfTeams: number;
  numberOfMembers: number;
  color: string;
}) => {
  return (
    <Link
      className={css(
        linkCardStyle,
        css`
          align-items: flex-start;
          justify-content: space-between;

          > * {
            padding: 0 1rem;
          }
        `
      )}
      to={url}
    >
      <Heading
        className={css`
          display: flex;
          align-items: center;
          height: 60%;
        `}
        level="3"
        size="small"
      >
        {name}
      </Heading>

      <div
        className={css`
          display: flex;
          gap: 1rem;
          background: ${color};
          color: var(--navds-global-color-gray-900);
          width: 100%;
          height: 40%;
          border-radius: 0 0 8px 8px;
        `}
      >
        <div className={iconWithTextStyle}>
          <img alt={""} src={teamCardIconCircle} width="30px" />
          {numberOfTeams} teams
        </div>
        <div className={iconWithTextStyle}>
          <img alt={""} src={teamCardResourceCircle} width="30px" />
          {numberOfMembers} personer
        </div>
      </div>
    </Link>
  );
};

export default AccordianResourceCard;
