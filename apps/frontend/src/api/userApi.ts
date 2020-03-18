import axios from "axios";
import { UserInfo } from "../constants";
import { env } from "../util/env";

// Add auth cookie to rest calls
axios.defaults.withCredentials = true;
console.log(env.teamCatalogBaseUrl);

export const getUserInfo = async () => axios.get<UserInfo>(`${env.teamCatalogBaseUrl}/userinfo`);
export const getTemp = async () => axios.get(`${env.teamCatalogBaseUrl}/team`);
