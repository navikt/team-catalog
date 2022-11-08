import { css } from "@emotion/css";

import type { ProductTeam } from "../../constants";
import { TeamCard } from "../common/Card";

const listStyles = css`
  display: flex;
  flex-wrap: wrap;
  gap: var(--navds-spacing-8);
`;

type TeamsNewProperties = {
  teams: ProductTeam[];
};

const Teams = (properties: TeamsNewProperties) => {
  const { teams } = properties;

  return (
    <div className={listStyles}>
      {teams.map((team: ProductTeam) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  );
};

export default Teams;
