import type { Cluster, ProductArea, ProductTeam, Resource } from "../../constants";
import { ResourceInfoContainer } from "../common/ResourceInfoContainer";
import CardArea from "./CardArea";
import CardCluster from "./CardCluster";
import CardTeam from "./CardTeam";

type ResourceAffiliationProperties = {
  resource: Resource;
  teams: ProductTeam[];
  productAreas: ProductArea[];
  clusters: Cluster[];
  navIdent: string;
};

const ResourceAffiliation = (properties: ResourceAffiliationProperties) => {
  const { teams, productAreas, clusters, navIdent } = properties;

  return (
    <ResourceInfoContainer title="Knytning til team og områder">
      {teams.map((team: ProductTeam) => (
        <CardTeam key={team.id} navIdent={navIdent} team={team} />
      ))}
      {productAreas.map((productArea: ProductArea) => (
        <CardArea area={productArea} key={productArea.id} navIdent={navIdent} />
      ))}
      {clusters.map((cluster: Cluster) => (
        <CardCluster cluster={cluster} key={cluster.id} navIdent={navIdent} />
      ))}
    </ResourceInfoContainer>
  );
};

export default ResourceAffiliation;
