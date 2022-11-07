import { css } from "@emotion/css";
import React from "react";
import { useNavigate } from "react-router-dom";

import type { DashData } from "../../components/dash/Dashboard";
import { useDash } from "../../components/dash/Dashboard";
import type { Cluster } from "../../constants";
import ClusterCard, { clusterCardInterface } from "./ClusterCard";

const clusterDivStyle = css`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: space-between;
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

  return out;
};

const ClusterCardList = (properties: ClusterCardListProperties) => {
  const { clusterList } = properties;
  const dash = useDash();
  const navigate = useNavigate();

  return (
    <React.Fragment>
      <div className={clusterDivStyle}>
        {clusters(clusterList, dash).map((element) => ClusterCard(element, "#EBCBD4", navigate))}
      </div>
    </React.Fragment>
  );
};

export default ClusterCardList;
