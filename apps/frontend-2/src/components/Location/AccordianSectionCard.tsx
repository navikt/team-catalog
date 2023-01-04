import type { LocationSimple } from "../../constants";
import AccordianResourceCard from "../common/AccordianResourceCard";
import ResourceCard from "../common/ResourceCard";

export type sectionCardInterface = {
  section: LocationSimple;
  teamCount: number;
  resourceCount: number;
};

const AccordianSectionCard = (properties: sectionCardInterface) => {
  const { section, teamCount, resourceCount } = properties;
  return (
    <AccordianResourceCard
      color={"#E6F1F8"}
      name={section.displayName}
      numberOfMembers={resourceCount}
      numberOfTeams={teamCount}
      url={`/location/${section.code}`}
    ></AccordianResourceCard>
  );
};

export default AccordianSectionCard;
