import { requireEnvironment } from "@navikt/backend-for-frontend-utils";

const azureAd = {
  clientId: requireEnvironment("AZURE_APP_CLIENT_ID"),
  issuer: requireEnvironment("AZURE_OPENID_CONFIG_ISSUER"),
  tokenEndpoint: requireEnvironment("AZURE_OPENID_CONFIG_TOKEN_ENDPOINT"),
  jwk: requireEnvironment("AZURE_APP_JWK"),
  openIdJwkUris: requireEnvironment("AZURE_OPENID_CONFIG_JWKS_URI"),
};

const proxy = {
  nomApiScope: requireEnvironment("NOM_API_SCOPE"),
  nomApiUrl: requireEnvironment("NOM_API_URL"),
  teamcatApiScope: requireEnvironment("TEAM_CATALOG_SCOPE"),
  teamcatApiUrl: requireEnvironment("TEAM_CATALOG_API_URL"),
};

const app = {
  nodeEnv: requireEnvironment("NODE_ENV"),
  host: requireEnvironment("EXPRESS_HOST"),
  port: Number(requireEnvironment("EXPRESS_PORT")),
};

export default { azureAd, proxy, app };
