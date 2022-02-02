import dotenv from 'dotenv';
dotenv.config();

const azureAd = {
    clientId: process.env["AZURE_APP_CLIENT_ID"],
    jwk: JSON.parse(process.env["AZURE_APP_JWK"]),
    issuer: process.env["AZURE_OPENID_CONFIG_ISSUER"],
    tokenEndpoint: process.env["AZURE_OPENID_CONFIG_TOKEN_ENDPOINT"],
    wellKnown: process.env["AZURE_APP_WELL_KNOWN_URL"],
    redirectUrl: process.env["AAD_LOGIN_CALLBACK_URL"],
    clientSecret: process.env["AZURE_APP_CLIENT_SECRET"]
}

export default { azureAd };