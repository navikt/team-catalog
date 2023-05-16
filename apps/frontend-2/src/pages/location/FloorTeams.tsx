import { css } from "@emotion/css";
import { Heading } from "@navikt/ds-react";

import { OfficeDaysChart } from "../../components/charts/OfficeDaysChart";
import { TeamCard } from "../../components/common/Card";
import { LargeDivider } from "../../components/Divider";
import type { LocationSimple } from "../../constants";
import type { LocationSummary } from "../../hooks";
import { useAllTeams } from "../../hooks";
import { LocationHeader } from "./components/LocationHeader";

type AccordionFloorsProperties = {
  locationCode: string;
  section: LocationSimple;
  locationStats: { [k: string]: LocationSummary };
};

export const FloorTeams = (properties: AccordionFloorsProperties) => {
  const { locationCode, section, locationStats } = properties;

  const currentTeamList = useAllTeams({ locationCode });

  return (
    <>
      <LocationHeader
        displayName={section.displayName}
        resourceCount={locationStats[section.code].resourceCount}
        teamCount={locationStats[section.code].teamCount}
      />
      <LargeDivider />
      <div
        className={css`
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
        `}
      >
        <div>
          <Heading level="2" size="medium" spacing>
            Disse teamene er i {section.description}
          </Heading>
          <div
            className={css`
              display: flex;
              flex-direction: column;
              gap: 1rem;
            `}
          >
            {(currentTeamList.data ?? []).map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
            {currentTeamList.data?.length === 0 && <p>Ingen team i denne etasjen</p>}
          </div>
        </div>
        <OfficeDaysChart />
      </div>
    </>
  );
};
