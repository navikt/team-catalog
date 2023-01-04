import type { LocationSimple } from "../../constants";
import ResourceCard from "../common/ResourceCard";

export type sectionCardInterface = {
  section: LocationSimple;
  teamCount: number;
  resourceCount: number;
};

const SectionCard = (properties: sectionCardInterface) => {
  const { section, teamCount, resourceCount } = properties;
  return (
    <ResourceCard
      color={"#E6F1F8"}
      name={section.displayName}
      numberOfMembers={resourceCount}
      numberOfTeams={teamCount}
      url={`/location/${section.code}`}
    ></ResourceCard>
  );
};

export default SectionCard;
