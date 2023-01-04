import ResourceCard from "../../components/common/ResourceCard";
import type { ProductAreaSummary2 } from "../../hooks";

export type paCardInterface = {
  name: string;
  id: string;
  paInfo?: ProductAreaSummary2;
};

const ProductAreaCard = ({ pa, color }: { pa: paCardInterface; color: string }) => {
  return (
    <ResourceCard
      color={color}
      name={pa.name}
      numberOfMembers={pa.paInfo?.uniqueResourcesCount || 0}
      numberOfTeams={pa.paInfo?.totalTeamCount || 0}
      url={`/area/${pa.id}`}
    ></ResourceCard>
  );
};

export default ProductAreaCard;
