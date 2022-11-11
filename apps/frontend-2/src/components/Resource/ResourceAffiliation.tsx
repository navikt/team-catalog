import type { Cluster, ProductArea, ProductTeam, Resource } from "../../constants";
import { AreaCard, ClusterCard, TeamCard } from "../common/Card";
import { ResourceInfoContainer } from "../common/ResourceInfoContainer";

type ResourceAffiliationProperties = {
  resource: Resource;
  teams: ProductTeam[];
  productAreas: ProductArea[];
  clusters: Cluster[];
};

const ResourceAffiliation = (properties: ResourceAffiliationProperties) => {
  const { teams, productAreas, clusters } = properties;

  return (
    <ResourceInfoContainer title="Knytning til team og områder">
      {teams.map((team: ProductTeam) => (
        <TeamCard key={team.id} team={team} />
      ))}
      {productAreas.map((productArea: ProductArea) => (
        <AreaCard area={productArea} key={productArea.id} />
      ))}
      {clusters.map((cluster: Cluster) => (
        <ClusterCard cluster={cluster} key={cluster.id} />
      ))}
      {[...teams, ...productAreas, ...clusters].length === 0 && <span>Ingen knytning til team eller område</span>}
    </ResourceInfoContainer>
  );
};

export default ResourceAffiliation;
