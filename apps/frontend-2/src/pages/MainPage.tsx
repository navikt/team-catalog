import { css } from "@emotion/css";
import { Fragment } from "react";

import { TeamSizeChart } from "../components/Charts/TeamSizeChart";
import { TeamTypeChart } from "../components/Charts/TeamTypeChart";

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
          <TeamSizeChart />
          <TeamTypeChart />
        </div>
        <div
          className={css`
            width: 50%;
          `}
        >
        </div>
      </div>
    </Fragment>
  );
};

export default MainPage;
