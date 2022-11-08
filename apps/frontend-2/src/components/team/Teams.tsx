import type { ProductTeam } from "../../constants";
import { CardContainer, TeamCard } from "../common/Card";

type TeamsNewProperties = {
  teams: ProductTeam[];
};

const Teams = (properties: TeamsNewProperties) => {
  const { teams } = properties;

  return (
    <CardContainer>
      {teams.map((team: ProductTeam) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </CardContainer>
  );
};

export default Teams;
