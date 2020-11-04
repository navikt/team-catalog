export const env = {
  teamCatalogBaseUrl: process.env.REACT_APP_TEAMCATALOG_ENDPOINT,
  amplitudeEndpoint: process.env.REACT_APP_AMPLITUDE_ENDPOINT,
  amplitudeApiKey: process.env.REACT_APP_AMPLITUDE_API_KEY,
  githubVersion: process.env.REACT_APP_GIT_VERSION || 'local',
  processCatBaseUrl: process.env.REACT_APP_PROCESS_CAT_BASE_URL,
  isSandbox: window.location.host.indexOf('sandbox') >= 0
};
