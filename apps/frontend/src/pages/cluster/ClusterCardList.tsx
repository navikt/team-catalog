import { css } from "@emotion/css";

import { ResourceCard } from "../../components/common/ResourceCard";
import { sortItems } from "../../components/team/ModalTeam";
import type { Cluster } from "../../constants";
import type { ClusterSummary2, DashData } from "../../hooks";
import { useDashboard } from "../../hooks";

export type clusterCardInterface = {
  name: string;
  id: string;
  clusterInfo?: ClusterSummary2;
};

const clusterDivStyle = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 3rem;

  @media (width <= 700px) {
    grid-template-columns: 1fr;
  }
`;

type ClusterCardListProperties = {
  clusterList: Cluster[];
};

const clusters = (clusterList: Cluster[], dash: DashData | undefined): clusterCardInterface[] => {
  const out: clusterCardInterface[] = [];

  if (dash) {
    for (const cluster of clusterList) {
      const currentClusterSummary = dash.clusterSummaryMap[cluster.id];
      const currentCluster: clusterCardInterface = {
        name: cluster.name,
        clusterInfo: currentClusterSummary,
        id: cluster.id,
      };
      out.push(currentCluster);
    }
  }

  return out.sort((a, b) => sortItems(a.name.toLowerCase(), b.name.toLocaleLowerCase()));
};

export const ClusterCardList = (properties: ClusterCardListProperties) => {
  const { clusterList } = properties;
  const dash = useDashboard();

  return (
    <div className={clusterDivStyle}>
      {clusters(clusterList, dash).map((cluster) => (
        <ResourceCard
          color="#F9CCD9"
          key={cluster.id}
          name={cluster.name}
          numberOfClusters={0}
          numberOfMembers={cluster.clusterInfo?.totalUniqueResourcesCount || 0}
          numberOfTeams={cluster.clusterInfo?.teamCount || 0}
          url={`/cluster/${cluster.id}`}
        />
      ))}
    </div>
  );
};
