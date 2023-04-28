import { css } from "@emotion/css";
import { Heading } from "@navikt/ds-react";
import { Fragment } from "react";

import locationRessources from "../../assets/locationRessources.svg";
import locationTeams from "../../assets/locationTeams.svg";
import { OfficeDaysChart } from "../../components/charts/OfficeDaysChart";
import { TeamCard } from "../../components/common/Card";
import { LargeDivider } from "../../components/Divider";
import type { LocationSimple } from "../../constants";
import type { LocationSummary } from "../../hooks";
import { useAllTeams } from "../../hooks";

type AccordionFloorsProperties = {
  locationCode: string;
  section: LocationSimple;
  locationStats: { [k: string]: LocationSummary };
};

const iconWithTextStyle = css`
  display: flex;
  gap: 0.5rem;
  flex-direction: row;
  align-items: center;
`;

const areaDivStyle = css`
  display: grid;
  gap: 1rem;
`;

export const FloorTeams = (properties: AccordionFloorsProperties) => {
  const { locationCode, section, locationStats } = properties;

  const currentTeamList = useAllTeams({ locationCode });

  return (
    <Fragment>
      <h1>{section.displayName}</h1>
      <p>Siden viser team som har lagt inn informasjon om lokasjon og hvilke dager de er på kontoret.</p>
      <div
        className={css`
          display: flex;
          gap: 1rem;
          color: var(--a-gray-900);
          width: 100%;
          border-radius: 0 0 8px 8px;
        `}
      >
        <div className={iconWithTextStyle}>
          <img alt={""} src={locationTeams} width="50px" />
          {locationStats[section.code].teamCount} teams
        </div>
        <div className={iconWithTextStyle}>
          <img alt={""} src={locationRessources} width="50px" />
          {locationStats[section.code].resourceCount} personer
        </div>
      </div>
      <LargeDivider />

      <div
        className={css`
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        `}
      >
        <div>
          <Heading level="2" size="medium" spacing>
            Disse teamene er i {section.description}
          </Heading>
          <div className={areaDivStyle}>
            {(currentTeamList.data ?? []).map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
            {currentTeamList.data?.length === 0 && <p>Ingen team i denne etasjen</p>}
          </div>
        </div>
        <OfficeDaysChart />
      </div>
    </Fragment>
  );
};
