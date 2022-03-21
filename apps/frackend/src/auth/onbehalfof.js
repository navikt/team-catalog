import config from "../config.js";
import jose from 'node-jose';
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios';


const azureAdHeaderConfig = {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
}

const addTokenToSession =  (req, res, next, scope) => {
    if(typeof req.session[scope] != "undefined"){
        if(req.session[scope].exp > (Date.now()/1000 + 10)){
            next();
        } else {
            refreshToken(req.session[scope].refreshToken, scope)
                .then(result => {
                    updateSession(req, scope, result);
                    next();
                })
                .catch(err => {
                    getNewToken(req, res, next, scope);
                })
        }
    } else {
        getNewToken(req, res, next, scope);
    }
}

const getNewToken = (req, res, next, scope) => {
    getOnBehalfOfToken(req, scope)
        .then((result) => {
            updateSession(req, scope, result);
            next();
        })
        .catch((err) => {
            console.error(err);
            res.redirect('/login');
        })
}

const updateSession = (req, scope, result) => {
    req.session[scope] = {
        exp: (Date.now()/1000)+result.data.expires_in,
        accessToken: result.data.access_token,
        refreshToken: result.data.refresh_token
    };
}

const getOnBehalfOfToken = async (req, scope) => {
    const passportStrategyProvidedAccessToken = req.session.passport.user.tokenSet.access_token
    const params = new URLSearchParams();
    params.append('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
    params.append('client_id', config.azureAd.clientId);
    params.append('client_assertion_type', 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer');
    params.append('requested_token_use', 'on_behalf_of');
    params.append('scope', scope);
    params.append('assertion', passportStrategyProvidedAccessToken);

    await generateClientAssertionToken().then((result) => {
        params.append('client_assertion', result);
    })

    return axios.post(config.azureAd.tokenEndpoint, params, azureAdHeaderConfig);
}

const generateClientAssertionToken = () => {

    const bodyCnt = {
        sub: config.azureAd.clientId,
        aud: config.azureAd.issuer,
        nbf: Math.floor(Date.now() / 1000) - 30,
        iss: config.azureAd.clientId,
        exp: Math.floor(Date.now() / 1000) + (60 * 60),
        jti: uuidv4(),
        iat: Math.floor(Date.now() / 1000) - 30
    };

    const signature = jose.JWS.createSign({
        alg: "RS256",
        format: 'compact'
    }, JSON.parse(process.env.AZURE_APP_JWK)).update(JSON.stringify(bodyCnt), "utf8").final();

    // signing
    return signature;
}

const refreshToken = async (refreshToken, scope) => {
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('client_id', config.azureAd.clientId);
    params.append('client_assertion_type', 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer');
    params.append('refresh_token', refreshToken);
    params.append('scope', scope);


    await generateClientAssertionToken().then((result) => {
        params.append('client_assertion', result);
    })

    return axios.post(config.azureAd.tokenEndpoint, params, azureAdHeaderConfig);
}

export default { addTokenToSession };