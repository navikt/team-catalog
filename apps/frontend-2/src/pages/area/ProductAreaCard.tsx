import { css } from "@emotion/css";
import { Heading, Link } from "@navikt/ds-react";

import teamCardIconCircle from "../../assets/teamCardIconCircle.svg";
import teamCardResourceCircle from "../../assets/teamCardResourceCircle.svg";
import type { ProductAreaSummary2 } from "../../components/dash/Dashboard";
import { linkCardStyle } from "../../util/styles";

export type paCardInterface = {
  name: string;
  id: string;
  paInfo?: ProductAreaSummary2;
};

const iconWithTextStyle = css`
  display: flex;
  gap: 0.5rem;
  flex-direction: row;
  align-items: center;
`;

export function ResourceCard({
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
}) {
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
      href={url}
    >
      <Heading
        className={css`
          display: flex;
          align-items: center;
          height: 50%;
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
          width: 100%;
          height: 50%;
          border-radius: 0 0 8px 8px;
        `}
      >
        <div className={iconWithTextStyle}>
          <img src={teamCardIconCircle} width="30px" />
          {numberOfTeams} teams
        </div>
        <div className={iconWithTextStyle}>
          <img src={teamCardResourceCircle} width="30px" />
          {numberOfMembers} personer
        </div>
      </div>
    </Link>
  );
}

const ProductAreaCard = ({ pa, color }: { pa: paCardInterface; color: string }) => {
  return (
    <ResourceCard
      color={color}
      name={pa.name}
      numberOfMembers={pa.paInfo?.uniqueResourcesCount || 0}
      numberOfTeams={pa.paInfo?.totalTeamCount || 0}
      url={`/area/${pa.id}`}
    ></ResourceCard>
  );
};

export default ProductAreaCard;
