import axios from "axios";
import { LocationSimple } from "../constants";
import { env } from "../util/env";

export const getAllLocations = async () => {
    const data = (await axios.get<LocationSimple[]>(`${env.teamCatalogBaseUrl}/location/simple`)).data;
    return data;
};

export const mapLocationsToOptions = (locations: LocationSimple[]) => {
    const filteredLocations = locations.filter((l: LocationSimple) => l.type === 'FLOOR').map((fl: LocationSimple) =>  ({ id: fl.code, label: fl.displayName}))
    return filteredLocations
}
