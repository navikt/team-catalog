import { css } from "@emotion/css";

import type { ProductTeam } from "../../../constants";
import CardTeam from "./CardTeam";

const listStyles = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
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
        <CardTeam key={team.id} team={team} />
      ))}
    </div>
  );
};

export default Teams;
