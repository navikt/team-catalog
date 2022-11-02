export const env = {
  teamCatalogBaseUrl: import.meta.env.VITE_TEAMCATALOG_ENDPOINT,
  nomApiBaseUrl: import.meta.env.VITE_NOMAPI_ENDPOINT,
  amplitudeEndpoint: import.meta.env.VITE_AMPLITUDE_ENDPOINT,
  amplitudeApiKey: import.meta.env.VITE_AMPLITUDE_API_KEY,
  githubVersion: import.meta.env.VITE_GIT_VERSION || 'local',
  processCatBaseUrl: import.meta.env.VITE_PROCESS_CAT_BASE_URL,
  isSandbox: window.location.host.includes('sandbox')
};
