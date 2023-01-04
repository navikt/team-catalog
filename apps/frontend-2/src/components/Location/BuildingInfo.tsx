import { css } from "@emotion/css";
import { Fragment } from "react";

import locationRessources from "../../assets/locationRessources.svg";
import locationTeams from "../../assets/locationTeams.svg";
import type { LocationSimple } from "../../constants";
import type { LocationSummary } from "../../hooks";
import { LargeDivider } from "../Divider";
import ChartNivo from "./ChartNivo";
import SectionCard from "./SectionCard";

type BuildingProperties = {
  locationCode: string;
  locationBuilding: LocationSimple;
  locationStats: { [k: string]: LocationSummary };
  sectionList: LocationSimple[];
  chartData: { day: string; resources: number }[];
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

const BuildingInfo = (properties: BuildingProperties) => {
  const { locationCode, sectionList, locationBuilding, locationStats, chartData } = properties;
  return (
    <Fragment>
      <h1>{locationBuilding?.displayName}</h1>
      <p>Siden viser team som har lagt inn informasjon om lokasjon og hvilke dager de er på kontoret.</p>
      <div
        className={css`
          display: flex;
          gap: 1rem;
          color: var(--navds-global-color-gray-900);
          width: 100%;
          height: 40%;
          border-radius: 0 0 8px 8px;
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
          justify-content: space-between;
        `}
      >
        <div
          className={css`
            width: 45%;
          `}
        >
          <h2>Slik er vi fordelt i {locationBuilding.description}</h2>
          <div className={areaDivStyle}>
            {sectionList.map((section) => (
              <SectionCard
                key={section.code}
                resourceCount={locationStats[section.code]?.resourceCount}
                section={section}
                teamCount={locationStats[section.code]?.teamCount}
              />
            ))}
          </div>
        </div>
        <div
          className={css`
            width: 45%;
          `}
        >
          <h2>Planlagte kontordager</h2>
          <div
            className={css`
              height: 500px;
            `}
          >
            <ChartNivo chartData={chartData} />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default BuildingInfo;
