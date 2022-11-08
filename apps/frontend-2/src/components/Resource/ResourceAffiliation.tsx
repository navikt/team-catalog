import { Heading } from "@navikt/ds-react";

import type { Cluster, ProductArea, ProductTeam, Resource } from "../../constants";
import { SmallDivider } from "../Divider";
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
    <div>
      <Heading size="medium">Knytning til team og områder</Heading>
      <SmallDivider />
      {teams.map((t: ProductTeam) => (
        <CardTeam key={t.id} navIdent={navIdent} team={t} />
      ))}
      {productAreas.map((p: ProductArea) => (
        <CardArea area={p} key={p.id} navIdent={navIdent} />
      ))}
      {clusters.map((c: Cluster) => (
        <CardCluster cluster={c} key={c.id} navIdent={navIdent} />
      ))}
    </div>
  );
};

export default ResourceAffiliation;
