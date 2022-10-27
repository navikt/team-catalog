import axios from "axios";

import type { LocationHierarchy, LocationSimple} from "../constants";
import { env } from "../util/env";

export const getLocationHierarchy = async () => {
    const {data} = await axios.get<LocationHierarchy[]>(`${environment.teamCatalogBaseUrl}/location/hierarchy`);
    return data;
}

export const getLocationByCode = async (locationCode: string) => {
    const {data} = await axios.get<LocationSimple>(`${environment.teamCatalogBaseUrl}/location/${locationCode}`);
    return data;
}

export const getLocationSimple = async () => {
    const {data} = await axios.get<LocationSimple[]>(`${environment.teamCatalogBaseUrl}/location//simple`);
    return data;
}

export const mapLocationsToOptions = (locations: LocationSimple[]) => {
    return locations.map((fl: LocationSimple) =>  ({ id: fl.code, label: fl.displayName}))
}
