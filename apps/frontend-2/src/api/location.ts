import axios from "axios";
import { LocationHierarchy, LocationSimple, PageResponse } from "../constants";
import { env } from "../util/env";

export const getLocationHierarchy = async () => {
    const data = (await axios.get<LocationHierarchy[]>(`${env.teamCatalogBaseUrl}/location/hierarchy`)).data;
    return data;
}

export const getLocationByCode = async (locationCode: string) => {
    const data = (await axios.get<LocationSimple>(`${env.teamCatalogBaseUrl}/location/${locationCode}`)).data;
    return data;
}

export const getLocationSimple = async () => {
    const data = (await axios.get<LocationSimple[]>(`${env.teamCatalogBaseUrl}/location//simple`)).data;
    return data;
}

export const mapLocationsToOptions = (locations: LocationSimple[]) => {
    return locations.map((fl: LocationSimple) =>  ({ value: fl.code, label: fl.displayName}))
}
