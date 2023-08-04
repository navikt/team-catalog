import axios from "axios";

import type { LocationHierarchy, LocationSimple } from "../constants";
import { env } from "../util/env";

export const getLocationHierarchy = async () => {
  const { data } = await axios.get<LocationHierarchy[]>(`${env.teamCatalogBaseUrl}/location/hierarchy`);
  return data;
};

export const mapLocationsToOptions = (locations: LocationSimple[]) => {
  return locations.map((fl: LocationSimple) => ({ value: fl.code, label: fl.displayName }));
};
