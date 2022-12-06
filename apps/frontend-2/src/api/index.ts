import axios from "axios";

import type { Cluster } from "../constants";

export * from "./clusterApi";
export * from "./productAreaApi";
export * from "./resourceApi";
export * from "./tagApi";
export * from "./teamApi";
export * from "./userApi";

export const mapToOptions = (list: Cluster[] | undefined) => {
  if (list) {
    return list.map((po) => ({ value: po.id, label: po.name }));
  }
  return [];
};

// Add auth cookie to rest calls
axios.defaults.withCredentials = true;
