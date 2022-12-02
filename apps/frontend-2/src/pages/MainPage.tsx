import { css } from "@emotion/css";
import { Fragment } from "react";

import areaCardBlue from "../assets/areaCardBlue.svg";
import peopleCardBlue from "../assets/peopleCardBlue.svg";
import teamCardBlue from "../assets/teamCardBlue.svg";
import { RolesChart } from "../components/Charts/RolesChart";
import { TeamExternalChart } from "../components/Charts/TeamExternalChart";
import { TeamSizeChart } from "../components/Charts/TeamSizeChart";
import { TeamTypeChart } from "../components/Charts/TeamTypeChart";
import FrontPageCard from "../components/dash/FrontPageCard";
import { useDashboard } from "../hooks/useDashboard";

const MainPage = () => {
  const dash = useDashboard();
  console.log(dash);

  // TODO Få inn riktige data i FrontPageCard


  return (
    <Fragment>
      <h1>Teamkatalogen</h1>
      <div
        className={css`
          display: flex;
          width: 100%;
          justify-content: space-between;
          margin-bottom: 4rem;
        `}
      >
        <FrontPageCard icon={areaCardBlue} primaryNumber={dash?.productAreas.length || 0} title="Områder" />
        <FrontPageCard
          icon={teamCardBlue}
          primaryNumber={dash?.teamsCount || 0}
          secondaryNumber={17}
          secondaryText="Sist oppdatert i uke"
          title="Team"
        />
        <FrontPageCard
          icon={peopleCardBlue}
          primaryNumber={1437}
          secondaryNumber={1730}
          secondaryText="Medlemskap"
          title="Personer"
        />
        <FrontPageCard
          annotation="%"
          icon={peopleCardBlue}
          primaryNumber={350}
          secondaryNumber={24}
          secondaryText="Andel"
          title="Eksterne"
        />
      </div>
      <div
        className={css`
          display: flex;
        `}
      >
        <div
          className={css`
            width: 50%;
          `}
        >
          <TeamTypeChart />
          <TeamSizeChart />
          <TeamExternalChart />
        </div>
        <div
          className={css`
            width: 50%;
          `}
        >
          <RolesChart />
        </div>
      </div>
    </Fragment>
  );
};

export default MainPage;
