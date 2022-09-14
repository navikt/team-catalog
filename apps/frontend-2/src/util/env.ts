export const env = {
  teamCatalogBaseUrl: import.meta.env.REACT_APP_TEAMCATALOG_ENDPOINT,
  nomApiBaseUrl: import.meta.env.REACT_APP_NOMAPI_ENDPOINT,
  amplitudeEndpoint: import.meta.env.REACT_APP_AMPLITUDE_ENDPOINT,
  amplitudeApiKey: import.meta.env.REACT_APP_AMPLITUDE_API_KEY,
  githubVersion: import.meta.env.REACT_APP_GIT_VERSION || 'local',
  processCatBaseUrl: import.meta.env.REACT_APP_PROCESS_CAT_BASE_URL,
  isSandbox: window.location.host.indexOf('sandbox') >= 0
};
