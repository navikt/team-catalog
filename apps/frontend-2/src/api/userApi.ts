import axios from "axios";

import type {UserInfo} from "../constants";
import {env as environment} from "../util/env";

export const getUserInfo = async () => axios.get<UserInfo>(`${environment.teamCatalogBaseUrl}/userinfo`)
