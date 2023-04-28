import { css } from "@emotion/css";
import { Fragment } from "react";

import locationRessources from "../../assets/locationRessources.svg";
import locationTeams from "../../assets/locationTeams.svg";
import { OfficeDaysChart } from "../../components/charts/OfficeDaysChart";
import { AccordianResourceCard } from "../../components/common/AccordianResourceCard";
import { LargeDivider } from "../../components/Divider";
import type { LocationSimple } from "../../constants";
import type { LocationSummary } from "../../hooks";

type BuildingFloorsProperties = {
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

export const BuildingFloors = (properties: BuildingFloorsProperties) => {
  const { section, locationStats } = properties;
  console.log(section);
  const floorList = [...(section.subLocations ?? [])].reverse();

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
          <h2>Slik er vi fordelt i {section.description}</h2>
          <div className={areaDivStyle}>
            {floorList.map((floor) => (
              <AccordianResourceCard
                color={"#E6F1F8"}
                key={floor.code}
                name={floor.displayName}
                numberOfMembers={locationStats[floor.code]?.resourceCount}
                numberOfTeams={locationStats[floor.code]?.teamCount}
                url={`/location/${floor.code}`}
              />
            ))}
          </div>
        </div>
        <OfficeDaysChart />
      </div>
    </Fragment>
  );
};
