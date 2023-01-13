import { css } from "@emotion/css";
import { Fragment, useEffect, useState } from "react";

import { getAllTeamsByLocationCode } from "../../api";
import locationRessources from "../../assets/locationRessources.svg";
import locationTeams from "../../assets/locationTeams.svg";
import type { LocationSimple, ProductTeam } from "../../constants";
import type { LocationSummary } from "../../hooks";
import { TeamCard } from "../common/Card";
import { LargeDivider } from "../Divider";
import ChartNivo from "./ChartNivo";

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

const countChartResources = (chartData: { day: string; resources: number }[]) => {
  return chartData.map((day) => day.resources).reduce((partialSum, a) => partialSum + a, 0);
};

const FloorTeams = (properties: AccordionFloorsProperties) => {
  const { locationCode, section, locationStats, chartData } = properties;

  const [currentTeamList, setCurrentTeamList] = useState<ProductTeam[]>();
  const [loading, setLoading] = useState<boolean>(true);

  const chartResourcesTotal = countChartResources(chartData);

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
          <h2>Disse teamene er i {section.description}</h2>
          <div className={areaDivStyle}>
            {currentTeamList && currentTeamList?.length > 1 && !loading ? (
              <Fragment>
                {currentTeamList.map((team) => (
                  <TeamCard key={team.id} team={team} />
                ))}
              </Fragment>
            ) : (
              <Fragment>
                <p>Ingen team i denne etasjen</p>
              </Fragment>
            )}
          </div>
        </div>
        {currentTeamList && chartResourcesTotal > 0 && !loading ? (
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
        ) : (
          <Fragment>
            <div
              className={css`
                width: 45%;
              `}
            >
              <h2>Planlagte kontordager</h2>
              <p>Ingen av teamene har fylt ut planlagte kontordager</p>
            </div>
          </Fragment>
        )}
      </div>
    </Fragment>
  );
};

export default FloorTeams;
