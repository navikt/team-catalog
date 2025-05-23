import { css } from "@emotion/css";
import { Heading } from "@navikt/ds-react";

import { OfficeDaysChart } from "../../../components/charts/OfficeDaysChart";
import { ResourceCard } from "../../../components/common/ResourceCard";
import type { LocationSimple } from "../../../constants";
import type { LocationSummary } from "../../../hooks";

type Properties = {
  locationStats: { [k: string]: LocationSummary };
  simpleLocationList: LocationSimple[];
  description: string;
};

export function LocationStats({ locationStats, simpleLocationList, description }: Properties) {
  return (
    <div
      className={css`
        display: flex;
        flex-wrap: wrap;
        gap: 2rem;
      `}
    >
      <div>
        <Heading level="2" size="medium" spacing>
          Slik er vi fordelt i {description}
        </Heading>
        <div
          className={css`
            display: flex;
            flex-direction: column;
            gap: 1rem;
          `}
        >
          {simpleLocationList.map((section) => (
            <ResourceCard
              color={"#E6F1F8"}
              key={section.code}
              name={section.displayName}
              numberOfClusters={0}
              numberOfMembers={locationStats[section.code]?.resourceCount}
              numberOfTeams={locationStats[section.code]?.teamCount}
              url={`/location/${section.code}`}
            />
          ))}
        </div>
      </div>
      <OfficeDaysChart />
    </div>
  );
}
