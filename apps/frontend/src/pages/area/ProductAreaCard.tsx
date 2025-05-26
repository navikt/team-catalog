import { ResourceCard } from "../../components/common/ResourceCard";
import type { ProductAreaSummary2 } from "../../hooks";

export type paCardInterface = {
  name: string;
  id: string;
  paInfo?: ProductAreaSummary2;
};

export const ProductAreaCard = ({ pa, color }: { pa: paCardInterface; color: string }) => {
  return (
    <ResourceCard
      color={color}
      name={pa.name}
      numberOfClusters={pa.paInfo?.clusterCount || 0}
      numberOfMembers={pa.paInfo?.uniqueResourcesCount || 0}
      numberOfTeams={pa.paInfo?.totalTeamCount || 0}
      url={`/area/${pa.id}`}
    ></ResourceCard>
  );
};
