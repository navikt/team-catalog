import { css } from "@emotion/css";
import { Fragment } from "react";

import { TeamSizeChart } from "../components/Charts/TeamSizeChart";
import { TeamTypeChart } from "../components/Charts/TeamTypeChart";
import { TeamExternalChart } from "../components/Charts/TeamExternalChart";
import { RolesChart } from "../components/Charts/RolesChart";

const MainPage = () => {
  return (
    <Fragment>
      <p>Siden er under utvikling</p>
      <h1>Teamkatalogen</h1>
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
