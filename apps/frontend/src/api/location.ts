import axios from "axios";
import { LocationSimple } from "../constants";
import { env } from "../util/env";

export const getAllLocations = async () => {
    const data = (await axios.get<LocationSimple[]>(`${env.teamCatalogBaseUrl}/location/simple?locationType=FLOOR`)).data;
    return data;
};

export const mapLocationsToOptions = (locations: LocationSimple[]) => {
    return locations.map((fl: LocationSimple) =>  ({ id: fl.code, label: fl.displayName}))
}
