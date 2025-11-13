import axios from "axios";

import type { OrgEnhetLederResponse } from "../constants";
import { env } from "../util/env"

export const getLeaderStateByNavident = async (navident: string) => {
    return (await axios.get<OrgEnhetLederResponse[]>(`${env.nomApiBaseUrl}/orgenhetleder/by-navident/${navident}`)).data;
};