import amplitude from "amplitude-js";

import { env } from "../util/env";

const AmplitudeConfig = {
  apiEndpoint: env.amplitudeEndpoint,
  saveEvents: false,
  includeUtm: true,
  includeReferrer: true,
  trackingOptions: {
    city: false,
    ip_address: false,
  },
};

export const instance = amplitude.getInstance();
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
instance.init(env.amplitudeApiKey!, undefined, AmplitudeConfig);
// eslint-disable-next-line unicorn/no-null -- package demands "null" and thus we cannot change it to undefined
instance.setUserId(null);
export const ampli = instance;
