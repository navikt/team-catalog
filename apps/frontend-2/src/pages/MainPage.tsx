import { css } from "@emotion/css";
import { Fragment } from "react";

import areaCardBlue from "../assets/areaCardBlue.svg";
import areaCardBlue_hover from "../assets/areaCardBlue_hover.svg";
import peopleCardBlue from "../assets/peopleCardBlue.svg";
import peopleCardBlue_hover from "../assets/peopleCardBlue_hover.svg";
import teamCardBlue from "../assets/teamCardBlue.svg";
import teamCardBlue_hover from "../assets/teamCardBlue_hover.svg";
import { RolesChart } from "../components/Charts/RolesChart";
import { TeamExternalChart } from "../components/Charts/TeamExternalChart";
import { TeamSizeChart } from "../components/Charts/TeamSizeChart";
import { TeamTypeChart } from "../components/Charts/TeamTypeChart";
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
      <div
        className={css`
          display: grid;
          grid-template-columns: 50% 50%;
          gap: 2rem;
        `}
      >
        <TeamTypeChart teams={teams} />
        <RolesChart
          areas={areas}
          className={css`
            grid-row: span 3;
          `}
          clusters={clusters}
          teams={teams}
        />
        <TeamSizeChart teams={teams} />
        <TeamExternalChart teams={teams} />
      </div>
    </Fragment>
  );
};

export default MainPage;
