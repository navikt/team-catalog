import type { Cluster } from "../../constants";
import { CardContainer, ClusterCard } from "../common/Card";

type ClustersNewProperties = {
  clusters: Cluster[];
};

const Clusters = (properties: ClustersNewProperties) => {
  const { clusters } = properties;

  return (
    <CardContainer>
      {clusters.map((cluster) => (
        <ClusterCard cluster={cluster} key={cluster.id} />
      ))}
    </CardContainer>
  );
};

export default Clusters;
