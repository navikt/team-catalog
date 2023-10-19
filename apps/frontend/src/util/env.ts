export const env = {
  teamCatalogBaseUrl: import.meta.env.VITE_TEAMCATALOG_ENDPOINT,
  nomApiBaseUrl: import.meta.env.VITE_NOMAPI_ENDPOINT,
  githubVersion: import.meta.env.VITE_GIT_VERSION || "local",
  processCatBaseUrl: import.meta.env.VITE_PROCESS_CAT_BASE_URL,
  isSandbox: window.location.host.includes("sandbox"),
  isDev: window.location.host.includes(".dev."),
  isLocal: window.location.host.includes("localhost"),
};
