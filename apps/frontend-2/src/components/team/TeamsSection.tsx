import { css } from "@emotion/css";
import { Heading } from "@navikt/ds-react";

import type { ProductTeamResponse } from "../../constants";
import { CardContainer, TeamCard } from "../common/Card";
import { TeamExport } from "../common/TeamExport";

export function TeamsSection({ teams }: { teams: ProductTeamResponse[] }) {
  return (
    <>
      <div
        className={css`
          display: flex;
          justify-content: space-between;
        `}
      >
        <Heading level="2" size="medium">
          Team ({teams.length})
        </Heading>
        {teams.length > 0 && <TeamExport />}
      </div>
      {teams.length > 0 ? (
        <CardContainer>
          {teams.map((team: ProductTeamResponse) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </CardContainer>
      ) : (
        <span>Ingen team i klyngen. Klyngen knyttes til teamene via teamsiden.</span>
      )}
    </>
  );
}
