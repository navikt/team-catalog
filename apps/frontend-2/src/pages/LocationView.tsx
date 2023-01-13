import { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getAllTeamsByLocationCode } from "../api";
import { getLocationHierarchy } from "../api/location";
import BuildingFloors from "../components/Location/BuildingFloors";
import BuildingInfo from "../components/Location/BuildingInfo";
import FloorTeams from "../components/Location/FloorTeams";
import type { LocationHierarchy, LocationSimple, ProductTeam } from "../constants";
import { useDashboard } from "../hooks";

const findSectionByCode = (locationHierarchy: LocationHierarchy[], code: string) => {
  return locationHierarchy[0].subLocations.find((sl) => code.includes(sl.code));
};

const findFloorByCode = (locationHierarchy: LocationHierarchy[], code: string) => {
  // eslint-disable-next-line unicorn/prefer-set-has
  const buildingCode = code.slice(0, 6);
  const floorCode = code.slice(7, 9);

  const currentSection = locationHierarchy[0].subLocations.find((sl) => buildingCode.includes(sl.code));

  if (currentSection) {
    const sectionFloors = currentSection.subLocations;
    const currentFloor = sectionFloors.find((floor) => floor.code.includes(floorCode));
    return currentFloor;
  } else {
    return undefined;
  }
};

const LocationView = () => {
  const parameters = useParams<{ locationCode?: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [locationBuilding, setLocationBuilding] = useState<LocationSimple>();
  const [locationSection, setLocationSection] = useState<LocationSimple>();
  const [locationFloor, setLocationFloor] = useState<LocationSimple>();
  const [teamList, setTeamList] = useState<ProductTeam[]>();

  const locationStats = useDashboard();

  const mapChartData = () => {
    if (!parameters.locationCode || !locationStats) return [];
    const location = locationStats?.locationSummaryMap[parameters.locationCode];

    return [
      { day: "Mandag", resources: location.monday.resourceCount },
      { day: "Tirsdag", resources: location.tuesday.resourceCount },
      { day: "Onsdag", resources: location.wednesday.resourceCount },
      { day: "Torsdag", resources: location.thursday.resourceCount },
      { day: "Fredag", resources: location.friday.resourceCount },
    ];
  };

  useEffect(() => {
    (async () => {
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
          const teamResponse = await getAllTeamsByLocationCode(parameters.locationCode);
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
        <Fragment>
          <BuildingInfo
            chartData={mapChartData()}
            locationBuilding={locationBuilding}
            locationCode={parameters.locationCode || ""}
            locationStats={locationStats.locationSummaryMap}
            sectionList={locationBuilding.subLocations || []}
          />
          ;
        </Fragment>
      )}
      {parameters.locationCode && locationSection && locationStats && !loading && (
        <Fragment>
          <BuildingFloors
            chartData={mapChartData()}
            locationStats={locationStats.locationSummaryMap}
            section={locationSection}
          />
        </Fragment>
      )}
      {parameters.locationCode && locationFloor && locationStats && (
        <Fragment>
          <FloorTeams
            chartData={mapChartData()}
            locationCode={parameters.locationCode}
            locationStats={locationStats.locationSummaryMap}
            section={locationFloor}
          />
        </Fragment>
      )}
    </Fragment>
  );
};
export default LocationView;
