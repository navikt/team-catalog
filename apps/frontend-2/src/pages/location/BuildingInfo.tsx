import { LargeDivider } from "../../components/Divider";
import type { LocationSimple } from "../../constants";
import type { LocationSummary } from "../../hooks";
import { LocationHeader } from "./components/LocationHeader";
import { LocationStats } from "./components/LocationStats";

type BuildingProperties = {
  locationCode: string;
  locationBuilding: LocationSimple;
  locationStats: { [k: string]: LocationSummary };
  sectionList: LocationSimple[];
};

export const BuildingInfo = (properties: BuildingProperties) => {
  const { locationCode, sectionList, locationBuilding, locationStats } = properties;
  return (
    <>
      <LocationHeader
        displayName={locationBuilding?.displayName}
        resourceCount={locationStats[locationCode].resourceCount}
        teamCount={locationStats[locationCode].teamCount}
      />
      <LargeDivider />
      <LocationStats
        description={locationBuilding.description}
        locationStats={locationStats}
        simpleLocationList={sectionList}
      />
    </>
  );
};
