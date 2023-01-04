import { css } from "@emotion/css";
import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getAllTeamsByLocationCode } from "../../api";
import locationRessources from "../../assets/locationRessources.svg";
import locationTeams from "../../assets/locationTeams.svg";
import type { LocationSimple, ProductTeam } from "../../constants";
import type { LocationSummary } from "../../hooks";
import { LargeDivider } from "../Divider";
import ChartNivo from "./ChartNivo";
import SectionCard from "./SectionCard";
import AccordianSectionCard from "./AccordianSectionCard";

type AccordionFloorsProperties = {
  locationCode: string;
  section: LocationSimple;
  locationStats: { [k: string]: LocationSummary };
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

const BuildingFloors = (properties: AccordionFloorsProperties) => {
  const { locationCode, section, locationStats, chartData } = properties;
  // const navigate = useNavigate();

  const [floorList, setFloorList] = useState<LocationSimple[]>(
    // eslint-disable-next-line no-unsafe-optional-chaining
    section.subLocations ? [...section.subLocations?.reverse()] : []
  );

  const [currentTeamList, setCurrentTeamList] = useState<ProductTeam[]>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const response = await getAllTeamsByLocationCode(locationCode);
      if (response) setCurrentTeamList(response.content);
      setLoading(false);
    })();
  }, [locationCode]);

  return (
    <Fragment>
      <h1>{section.displayName}</h1>
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
          display: flex;
          justify-content: space-between;
        `}
      >
        <div
          className={css`
            width: 45%;
          `}
        >
          <h2>Slik er vi fordelt i {section.description}</h2>
          <div className={areaDivStyle}>
            {floorList.map((floor) => (
              <AccordianSectionCard
                key={floor.code}
                resourceCount={locationStats[floor.code]?.resourceCount}
                section={floor}
                teamCount={locationStats[floor.code]?.teamCount}
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

export default BuildingFloors;
