import amplitude from 'amplitude-js'

import { env as environment } from '../util/env'

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
instance.setUserId(null)
export const ampli = instance
