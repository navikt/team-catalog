import { css } from "@emotion/css";

import type { Cluster } from "../../constants";
import { ClusterCard } from "../common/Card";

const listStyles = css`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

type ClustersNewProperties = {
  clusters: Cluster[];
};

const Clusters = (properties: ClustersNewProperties) => {
  const { clusters } = properties;

  return (
    <div className={listStyles}>
      {clusters.map((cluster) => (
        <ClusterCard cluster={cluster} key={cluster.id} />
      ))}
    </div>
  );
};

export default Clusters;
