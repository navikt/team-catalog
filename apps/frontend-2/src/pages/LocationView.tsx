import { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getLocationHierarchy } from "../api/location";
import BuildingFloors from "../components/Location/BuildingFloors";
import BuildingInfo from "../components/Location/BuildingInfo";
import type { LocationHierarchy, LocationSimple } from "../constants";
import { useDashboard } from "../hooks";

const findSectionByCode = (locationHierarchy: LocationHierarchy[], code: string) => {
  return locationHierarchy[0].subLocations.find((sl) => code.includes(sl.code));
};

const LocationView = () => {
  const parameters = useParams<{ locationCode?: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [locationBuilding, setLocationBuilding] = useState<LocationSimple>();
  const [locationSection, setLocationSection] = useState<LocationSimple>();
  const [locationFloor, setLocationFloor] = useState<LocationSimple>();

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

  //TODO Endre spørring til sjekke om det er bygning, seksjon eller etasje
  useEffect(() => {
    (async () => {
      if (!parameters.locationCode || parameters.locationCode === "FA1") {
        setLoading(true);
        const response = await getLocationHierarchy();
        if (response) {
          setLocationBuilding(response[0]);
          setLocationSection(undefined);
        }
        setLoading(false);
      } else {
        if (parameters.locationCode?.includes(locationSection ? locationSection.code : " ")) {
          setLoading(false);
        } else {
          setLoading(true);
          const response = await getLocationHierarchy();
          if (response && parameters.locationCode) {
            setLocationSection(findSectionByCode(response, parameters.locationCode));
            setLocationBuilding(undefined);
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
            locationCode={parameters.locationCode}
            locationStats={locationStats.locationSummaryMap}
            section={locationSection}
          />
        </Fragment>
      )}
    </Fragment>
  );
};
export default LocationView;
