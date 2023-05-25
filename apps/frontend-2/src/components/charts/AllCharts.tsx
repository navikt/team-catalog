import { css } from "@emotion/css";

import type { Cluster, ProductArea, ProductTeamResponse } from "../../constants";
import { RolesChart } from "./RolesChart";
import { TeamExternalChart } from "./TeamExternalChart";
import { TeamSizeChart } from "./TeamSizeChart";
import { TeamTypeChart } from "./TeamTypeChart";

export function AllCharts({
  teams,
  areas,
  clusters,
}: {
  teams: ProductTeamResponse[];
  areas: ProductArea[];
  clusters: Cluster[];
}) {
  return (
    <div
      className={css`
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;

        @media screen and (max-width: 1100px) {
          grid-template-columns: 1fr;
        }
      `}
    >
      {teams.length > 0 && <TeamTypeChart teams={teams} />}
      {areas.length + clusters.length + teams.length > 0 && (
        <RolesChart
          areas={areas}
          className={css`
            grid-row: span 3;
          `}
          clusters={clusters}
          teams={teams}
        />
      )}
      {teams.length > 0 && <TeamSizeChart teams={teams} />}
      {teams.length > 0 && <TeamExternalChart teams={teams} />}
    </div>
  );
}
