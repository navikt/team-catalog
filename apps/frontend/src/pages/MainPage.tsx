import { css } from "@emotion/css";
import React, { Fragment, useEffect } from "react";

import areaCardBlue from "../assets/areaCardBlue.svg";
import areaCardBlue_hover from "../assets/areaCardBlue_hover.svg";
import peopleCardBlue from "../assets/peopleCardBlue.svg";
import peopleCardBlue_hover from "../assets/peopleCardBlue_hover.svg";
import teamCardBlue from "../assets/teamCardBlue.svg";
import teamCardBlue_hover from "../assets/teamCardBlue_hover.svg";
import { AllCharts } from "../components/charts/AllCharts";
import { FrontPageCard } from "../components/dash/FrontPageCard";
import { Status } from "../constants";
import { useAllClusters, useAllProductAreas, useAllTeams, useDashboard } from "../hooks";
import { calculatePercentage } from "../util/util";

export const MainPage = () => {
  const dash = useDashboard();

  const teams = useAllTeams({ status: Status.ACTIVE }).data ?? [];
  const areas = useAllProductAreas({ status: Status.ACTIVE }).data ?? [];
  const clusters = useAllClusters({ status: Status.ACTIVE }).data ?? [];

  useEffect(() => {
    if (dash) {
      document.title = `Teamkatalogen`;
    }
  }, [dash]);

  return (
    <Fragment>
      <div
        className={css`
          display: flex;
          justify-content: space-between;
          gap: var(--a-spacing-4);
          flex-wrap: wrap;
          margin-bottom: 4rem;
        `}
      >
        <FrontPageCard
          hoverIcon={areaCardBlue_hover}
          icon={areaCardBlue}
          primaryNumber={dash?.productAreasCount || 0}
          title="områder"
          url="/area"
        />
        <FrontPageCard
          hoverIcon={teamCardBlue_hover}
          icon={teamCardBlue}
          primaryNumber={dash?.total.teams || 0}
          secondaryText={`Oppdatert siste uke: ${dash?.total.teamsEditedLastWeek ?? 0}`}
          title="team"
          url="/team"
        />
        <FrontPageCard
          hoverIcon={peopleCardBlue_hover}
          icon={peopleCardBlue}
          primaryNumber={dash?.total.uniqueResources || 0}
          secondaryText={`Medlemskap: ${dash?.total.totalResources ?? 0}`}
          title="personer"
          url="/memberships"
        />
        <FrontPageCard
          hoverIcon={peopleCardBlue_hover}
          icon={peopleCardBlue}
          primaryNumber={dash?.total.uniqueResourcesExternal || 0}
          secondaryText={`Andel: ${calculatePercentage(
            dash?.total.uniqueResourcesExternal || 0,
            dash?.total.uniqueResources || 0,
          )}%`}
          title="eksterne"
          url="/memberships?type=EXTERNAL"
        />
      </div>
      <AllCharts areas={areas} clusters={clusters} teams={teams} />
    </Fragment>
  );
};
