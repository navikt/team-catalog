import { css } from "@emotion/css";
import React, { Fragment } from "react";

import areaCardBlue from "../assets/areaCardBlue.svg";
import areaCardBlue_hover from "../assets/areaCardBlue_hover.svg";
import peopleCardBlue from "../assets/peopleCardBlue.svg";
import peopleCardBlue_hover from "../assets/peopleCardBlue_hover.svg";
import teamCardBlue from "../assets/teamCardBlue.svg";
import teamCardBlue_hover from "../assets/teamCardBlue_hover.svg";
import { AllCharts } from "../components/Charts/AllCharts";
import FrontPageCard from "../components/dash/FrontPageCard";
import { Status } from "../constants";
import { useAllClusters, useAllProductAreas, useAllTeams, useDashboard } from "../hooks";

const MainPage = () => {
  const dash = useDashboard();

  const teams = useAllTeams({ status: Status.ACTIVE }).data ?? [];
  const areas = useAllProductAreas({ status: Status.ACTIVE }).data ?? [];
  const clusters = useAllClusters({ status: Status.ACTIVE }).data ?? [];

  return (
    <Fragment>
      <div
        className={css`
          margin-top: 5rem;
          display: flex;
          width: 100%;
          justify-content: space-between;
          margin-bottom: 4rem;
        `}
      >
        {/*TODO kortene under er ikke tabable, må fikses*/}
        <FrontPageCard
          hoverIcon={areaCardBlue_hover}
          icon={areaCardBlue}
          primaryNumber={dash?.productAreasCount || 0}
          title="Områder"
          url={"/area"}
        />
        <FrontPageCard
          hoverIcon={teamCardBlue_hover}
          icon={teamCardBlue}
          primaryNumber={dash?.total.teams || 0}
          secondaryNumber={dash?.total.teamsEditedLastWeek.toString() || "0"}
          secondaryText="Oppdatert i siste uke"
          title="Team"
          url="/team"
        />
        <FrontPageCard
          hoverIcon={peopleCardBlue_hover}
          icon={peopleCardBlue}
          primaryNumber={dash?.total.uniqueResources || 0}
          secondaryNumber={dash?.total.totalResources.toString() || "0"}
          secondaryText="Medlemskap"
          title="Personer"
          url={"/memberships"}
        />
        <FrontPageCard
          annotation="%"
          hoverIcon={peopleCardBlue_hover}
          icon={peopleCardBlue}
          primaryNumber={dash?.total.uniqueResourcesExternal || 0}
          secondaryNumber={(
            ((dash?.total.uniqueResourcesExternal || 0) * 100) /
            (dash?.total.uniqueResources || 0)
          ).toFixed(0)}
          secondaryText="Andel"
          title="Eksterne"
          url="/memberships?type=EXTERNAL"
        />
      </div>
      <AllCharts areas={areas} clusters={clusters} teams={teams} />
    </Fragment>
  );
};

export default MainPage;
