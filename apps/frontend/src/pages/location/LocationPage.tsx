import { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getLocationHierarchy } from "../../api/locationApi";
import { getAllTeams } from "../../api/teamApi";
import type { LocationHierarchy, LocationSimple, ProductTeamResponse } from "../../constants";
import { useDashboard } from "../../hooks";
import { BuildingFloors } from "./BuildingFloors";
import { BuildingInfo } from "./BuildingInfo";
import { FloorTeams } from "./FloorTeams";

const findSectionByCode = (locationHierarchy: LocationHierarchy[], code: string) => {
  return locationHierarchy[0].subLocations.find((sl) => code.includes(sl.code));
};

const findFloorByCode = (locationHierarchy: LocationHierarchy[], code: string) => {
  const buildingCode = code.slice(0, 6);
  const floorCode = code.slice(7, 9);

  const currentSection = locationHierarchy[0].subLocations.find((sl) => buildingCode.includes(sl.code));

  if (currentSection) {
    const sectionFloors = currentSection.subLocations;
    return sectionFloors.find((floor) => floor.code.includes(floorCode));
  } else {
    return undefined;
  }
};

export const LocationPage = () => {
  const parameters = useParams<{ locationCode?: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [locationBuilding, setLocationBuilding] = useState<LocationSimple>();
  const [locationSection, setLocationSection] = useState<LocationSimple>();
  const [locationFloor, setLocationFloor] = useState<LocationSimple>();
  const [, setTeamList] = useState<ProductTeamResponse[]>();

  const locationStats = useDashboard();

  useEffect(() => {
    (async () => {
      document.title = `Teamkatalogen`;
      let isFloor = false;
      if (parameters.locationCode) {
        isFloor = /.E\d$/.test(parameters.locationCode);
      }
      if (!parameters.locationCode || parameters.locationCode === "FA1") {
        setLoading(true);
        const response = await getLocationHierarchy();
        if (response) {
          setLocationBuilding(response[0]);
          setLocationSection(undefined);
          setLocationFloor(undefined);
        }
        setLoading(false);
      } else if (isFloor) {
        setLoading(true);
        const response = await getLocationHierarchy();
        if (response && parameters.locationCode) {
          const currentLocationFloor = findFloorByCode(response, parameters.locationCode);
          setLocationFloor(currentLocationFloor);
          setLocationSection(undefined);
          setLocationBuilding(undefined);
          const teamResponse = await getAllTeams({ locationCode: parameters.locationCode });
          setTeamList(teamResponse.content);
        }
        setLoading(false);
      } else {
        if (parameters.locationCode?.includes(locationSection ? locationSection.code : " ")) {
          // setLoading(false);
        } else {
          setLoading(true);
          const response = await getLocationHierarchy();
          if (response && parameters.locationCode) {
            setLocationSection(findSectionByCode(response, parameters.locationCode));
            setLocationBuilding(undefined);
            setLocationFloor(undefined);
          }
          setLoading(false);
        }
      }
    })();
  }, [parameters.locationCode]);

  return (
    <Fragment>
      {!loading && locationBuilding && locationStats && (
        <BuildingInfo
          locationBuilding={locationBuilding}
          locationCode={parameters.locationCode || ""}
          locationStats={locationStats.locationSummaryMap}
          sectionList={locationBuilding.subLocations || []}
        />
      )}
      {parameters.locationCode && locationSection && locationStats && !loading && (
        <BuildingFloors locationStats={locationStats.locationSummaryMap} section={locationSection} />
      )}
      {parameters.locationCode && locationFloor && locationStats && (
        <FloorTeams
          locationCode={parameters.locationCode}
          locationStats={locationStats.locationSummaryMap}
          section={locationFloor}
        />
      )}
    </Fragment>
  );
};
