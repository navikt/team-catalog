import axios from "axios";
import {UserInfo} from "../constants";
import {env} from "../util/env";

export const getUserInfo = async () => axios.get<UserInfo>(`${env.teamCatalogBaseUrl}/userinfo`)
