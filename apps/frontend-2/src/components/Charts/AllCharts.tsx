import { css } from "@emotion/css";

import type { Cluster, ProductArea, ProductTeam } from "../../constants";
import { RolesChart } from "./RolesChart";
import { TeamExternalChart } from "./TeamExternalChart";
import { TeamSizeChart } from "./TeamSizeChart";
import { TeamTypeChart } from "./TeamTypeChart";

export function AllCharts({
  teams,
  areas,
  clusters,
}: {
  teams: ProductTeam[];
  areas: ProductArea[];
  clusters: Cluster[];
}) {
  return (
    <div
      className={css`
        display: grid;
        grid-template-columns: 1fr 1fr;
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
  );
}
