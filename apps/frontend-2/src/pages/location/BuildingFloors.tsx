import { LargeDivider } from "../../components/Divider";
import type { LocationSimple } from "../../constants";
import type { LocationSummary } from "../../hooks";
import { LocationHeader } from "./components/LocationHeader";
import { LocationStats } from "./components/LocationStats";

type BuildingFloorsProperties = {
  section: LocationSimple;
  locationStats: { [k: string]: LocationSummary };
};

export const BuildingFloors = (properties: BuildingFloorsProperties) => {
  const { section, locationStats } = properties;
  const floorList = [...(section.subLocations ?? [])].reverse();

  return (
    <>
      <LocationHeader
        displayName={section?.displayName}
        resourceCount={locationStats[section.code].resourceCount}
        teamCount={locationStats[section.code].teamCount}
      />
      <LargeDivider />
      <LocationStats description={section.description} locationStats={locationStats} simpleLocationList={floorList} />
    </>
  );
};
