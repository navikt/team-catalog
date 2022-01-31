import jose from 'node-jose';
import { randomUUID } from 'crypto';
import fetch from "node-fetch";


const setOnBehalfOfToken = (req, scope) => {
    //var reqTokenBody = {
        //scope: scope,
        //client_id: process.env.AZURE_APP_CLIENT_ID,
        //client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
        //client_assertion: generateClientAssertionToken(JSON.parse(process.env.AZURE_APP_JWK)),
        //assertion: req.session.accessToken,
        //grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        //requested_token_use: "on_behalf_of"
    //};


    var reqTokenBody =
        "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&"+
        "client_id="+process.env.AZURE_APP_CLIENT_ID + "&" +
        "client_assertion="+ generateClientAssertionToken(JSON.parse(process.env.AZURE_APP_JWK)) +"&" +
        "client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer&"+
        "requested_token_use=on_behalf_of&"+
        "assertion="+req.session.accessToken + "&" +
        "scope="+scope;

    var token = fetch("https://login.microsoftonline.com/966ac572-f5b7-4bbe-aa88-c76419c0f851/oauth2/v2.0/token",
        {
            method: 'POST',
            headers:
                {
                    'Content-Type': 'application/x-www-form-urlencoded',

                },
            body: reqTokenBody,
        }).then((response) => response.json()).then((data) =>
    {
        console.log(JSON.stringify(data, null, 2));
    }).catch((error) =>
    {
        console.log(error);
    });

    //console.log(token);
}

const generateClientAssertionToken = (jwk) => {

    var bodyCnt = {
        sub: process.env.AZURE_APP_CLIENT_ID,
        aud: process.env.AZURE_OPENID_CONFIG_ISSUER,
        nbf: Math.floor(Date.now() / 1000) - 30,
        iss: process.env.AZURE_APP_CLIENT_ID,
        exp: Math.floor(Date.now() / 1000) + (60 * 60),
        jti: randomUUID(),
        iat: Math.floor(Date.now() / 1000) - 30
    };

    var signature =
        jose.JWS.createSign({
            alg: "RS256",
            format: 'compact'
        }, jwk).
        update(JSON.stringify(bodyCnt), "utf8").
        final();

    // signing
    return signature.then(function(result) {
        console.log(result);
        return result;
    }, function(error) {
        console.log(error);
    });
}
//generateClientAssertionToken (JSON.parse(process.env.AZURE_APP_JWK));

export default { setOnBehalfOfToken };