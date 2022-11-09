import { css } from "@emotion/css";
import { Button, Heading } from "@navikt/ds-react";

import type { ProductTeam } from "../../constants";
import { CardContainer, TeamCard } from "../common/Card";

export function TeamsSection({ teams }: { teams: ProductTeam[] }) {
  return (
    <>
      <div
        className={css`
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
        `}
      >
        <Heading
          className={css`
            margin-right: 2rem;
            margin-top: 0;
          `}
          size="medium"
        >
          Team ({teams.length})
        </Heading>
        <Button
          className={css`
            margin-right: 1rem;
          `}
          size="medium"
          variant="secondary"
        >
          Eksporter team
        </Button>
      </div>
      <CardContainer>
        {teams.map((team: ProductTeam) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </CardContainer>
    </>
  );
}
