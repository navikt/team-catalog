import amplitude from 'amplitude-js'

import { env } from '../util/env'

const AmplitudeConfig = {
  apiEndpoint: environment.amplitudeEndpoint,
  saveEvents: false,
  includeUtm: true,
  includeReferrer: true,
  trackingOptions: {
    city: false,
    ip_address: false
  }
}

export const instance = amplitude.getInstance()
instance.init(environment.amplitudeApiKey!, undefined, AmplitudeConfig)
// eslint-disable-next-line unicorn/no-null -- package demands "null" and thus we cannot change it to undefined
instance.setUserId(null)
export const ampli = instance
