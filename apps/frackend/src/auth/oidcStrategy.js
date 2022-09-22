import { Issuer, Strategy } from 'openid-client';
import config from "../config.js"

const authorizationServerMetadata = {
    client_id: config.azureAd.clientId,
    client_secret: config.azureAd.clientSecret,
    redirect_uris: config.azureAd.redirectUrl,
    token_endpoint_auth_method: config.azureAd.tokenEndpointAuthMethod
};

function optionsWithClient(oidcClient) {
    return {
        client: oidcClient,
        params: {
            response_types: config.azureAd.responseTypes,
            response_mode: config.azureAd.responseMode,
            scope: config.azureAd.scopes,
            redirect_uri: config.app.isLocal ? undefined :  config.azureAd.redirectUrl.filter(it => !it.includes("-beta"))[0],
        },
        passReqToCallback: false,
    };
}

function verify(tokenSet, done) {
    if (tokenSet.expired()) {
        return done(null, false)
    }
    const user = {
        'tokenSet': tokenSet,
        'claims': tokenSet.claims()
    };
    return done(null, user);
}

async function createOpenIdClientStrategy() {
    const discoveredIssuer = await Issuer.discover(config.azureAd.issuer)
    const oidcClient = new discoveredIssuer.Client(authorizationServerMetadata)
    const strategy = new Strategy(optionsWithClient(oidcClient), verify);
    return {client: oidcClient, strategy}
}

export default (await createOpenIdClientStrategy())