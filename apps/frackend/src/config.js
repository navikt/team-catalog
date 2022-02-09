import dotenv from 'dotenv';
dotenv.config(
    {
        path: process.env.NODE_ENV === 'development' ? './.localenv' : './.env'
    }
);

const requiredEnvs = {
    clientId: process.env["AZURE_APP_CLIENT_ID"],
    jwkStr: process.env["AZURE_APP_JWK"],
    issuer: process.env["AZURE_OPENID_CONFIG_ISSUER"],
    tokenEndpoint: process.env["AZURE_OPENID_CONFIG_TOKEN_ENDPOINT"],
    wellKnown: process.env["AZURE_APP_WELL_KNOWN_URL"],
    redirectUrl: process.env["AAD_LOGIN_CALLBACK_URL"],
    clientSecret: process.env["AZURE_APP_CLIENT_SECRET"]
}

Object.keys(requiredEnvs).forEach(key => {
    if(requiredEnvs[key] === undefined) {
        const str = `config requires '${key}' from environment variables`;
        throw new Error(str)
    }
})

const azureAd = {
    ...requiredEnvs,
    jwk: JSON.parse(requiredEnvs.jwkStr),
}


export default azureAd;