import { css } from "@emotion/css";
import { Button, Heading } from "@navikt/ds-react";
import { Fragment } from "react";

import type { ProductTeam } from "../../constants";
import { CardContainer, TeamCard } from "../common/Card";
import { TeamExport } from "../common/TeamExport";

export function TeamsSection({ teams }: { teams: ProductTeam[] }) {
  if (teams.length === 0) {
    return (
      <Fragment>
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
            level={"2"}
            size="medium"
          >
            Team ({teams.length})
          </Heading>
          <Button disabled size="medium" variant="secondary">
            Eksporter team
          </Button>
        </div>
        <p>Ingen team i klyngen. Klyngen knyttes til teamene via teamsiden.</p>
      </Fragment>
    );
  }
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
          level={"2"}
          size="medium"
        >
          Team ({teams.length})
        </Heading>
        <TeamExport />
      </div>
      <CardContainer>
        {teams.map((team: ProductTeam) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </CardContainer>
    </>
  );
}
