import { css } from "@emotion/css";
import { Heading } from "@navikt/ds-react";

import locationRessources from "../../../assets/locationRessources.svg";
import locationTeams from "../../../assets/locationTeams.svg";

const iconWithTextStyle = css`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

export function LocationHeader({
  displayName,
  teamCount,
  resourceCount,
}: {
  displayName?: string;
  teamCount: number;
  resourceCount: number;
}) {
  return (
    <>
      <Heading level="1" size="large">
        {displayName}
      </Heading>
      <p>Siden viser team som har lagt inn informasjon om lokasjon og hvilke dager de er på kontoret.</p>
      <div
        className={css`
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        `}
      >
        <div className={iconWithTextStyle}>
          <img alt={""} src={locationTeams} width="50px" />
          {teamCount} teams
        </div>
        <div className={iconWithTextStyle}>
          <img alt={""} src={locationRessources} width="50px" />
          {resourceCount} personer
        </div>
      </div>
    </>
  );
}
