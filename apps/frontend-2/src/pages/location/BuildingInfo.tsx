import { css } from "@emotion/css";
import { Heading } from "@navikt/ds-react";

import locationRessources from "../../assets/locationRessources.svg";
import locationTeams from "../../assets/locationTeams.svg";
import { OfficeDaysChart } from "../../components/charts/OfficeDaysChart";
import { ResourceCard } from "../../components/common/ResourceCard";
import { LargeDivider } from "../../components/Divider";
import type { LocationSimple } from "../../constants";
import type { LocationSummary } from "../../hooks";

type BuildingProperties = {
  locationCode: string;
  locationBuilding: LocationSimple;
  locationStats: { [k: string]: LocationSummary };
  sectionList: LocationSimple[];
};

const iconWithTextStyle = css`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

export const BuildingInfo = (properties: BuildingProperties) => {
  const { locationCode, sectionList, locationBuilding, locationStats } = properties;
  return (
    <>
      <Heading level="1" size="large">
        {locationBuilding?.displayName}
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
          {locationStats[locationCode].teamCount} teams
        </div>
        <div className={iconWithTextStyle}>
          <img alt={""} src={locationRessources} width="50px" />
          {locationStats[locationCode].resourceCount} personer
        </div>
      </div>
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
            Slik er vi fordelt i {locationBuilding.description}
          </Heading>
          <div
            className={css`
              display: flex;
              flex-direction: column;
              gap: 1rem;
            `}
          >
            {sectionList.map((section) => (
              <ResourceCard
                color={"#E6F1F8"}
                key={section.code}
                name={section.displayName}
                numberOfMembers={locationStats[section.code]?.resourceCount}
                numberOfTeams={locationStats[section.code]?.teamCount}
                url={`/location/${section.code}`}
              />
            ))}
          </div>
        </div>
        <OfficeDaysChart />
      </div>
    </>
  );
};
