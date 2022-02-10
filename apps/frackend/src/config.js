import dotenv from 'dotenv';
dotenv.config(
    {
        path: process.env.NODE_ENV === 'development' ? './.localenv' : './.env'
    }
);

function requireEnv(envName) {
    const envContent = process.env[envName];
    if (!envContent) throw new Error("Missing environment variable with name: " + envName);
    return envContent;
}

function requireEnvAsJson(envName){
    try {
        return JSON.parse(requireEnv(envName))
    } catch (error) {
        const msg = "Environment variable with name: " + envName + " is not valid json";
        console.error(msg)
        throw error;
    }
}

const azureAd = {
    clientId: requireEnv("AZURE_APP_CLIENT_ID"),
    jwk: requireEnvAsJson("AZURE_APP_JWK"),
    issuer: requireEnv("AZURE_OPENID_CONFIG_ISSUER"),
    tokenEndpoint: requireEnv("AZURE_OPENID_CONFIG_TOKEN_ENDPOINT"),
    wellKnown: requireEnv("AZURE_APP_WELL_KNOWN_URL"),
    redirectUrl: requireEnv("AAD_LOGIN_CALLBACK_URL"),
    clientSecret: requireEnv("AZURE_APP_CLIENT_SECRET")
}

const proxy = {
    nomApiScope: requireEnv("NOM_API_SCOPE"),
    nomApiUrl: requireEnv("NOM_API_URL"),
    teamCatScope: requireEnv("TEAM_CATALOG_SCOPE"),
    teamCatBackendUrl: requireEnv("TEAM_CATALOG_BACKEND_URL"),
}

export default {azureAd, proxy};