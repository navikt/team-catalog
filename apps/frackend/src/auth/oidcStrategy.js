import {OIDCStrategy} from "passport-azure-ad";

const getOidcStrategy = () => {
    return new OIDCStrategy({
        identityMetadata: process.env["AZURE_APP_WELL_KNOWN_URL"],
        clientID: process.env["AZURE_APP_CLIENT_ID"],
        responseType: 'code',
        responseMode: 'query',
        redirectUrl: process.env["AAD_LOGIN_CALLBACK_URL"],
        allowHttpForRedirectUrl: true,
        clientSecret: process.env["AZURE_APP_CLIENT_SECRET"],
        passReqToCallback: true,
        validateIssuer: true,
        scope: ['profile', 'email', 'offline_access', process.env["AZURE_APP_CLIENT_ID"]+'/.default'],
        loggingLevel: 'info',
        loggingNoPII: false,
    }, (req, iss, sub, profile, accessToken, refreshToken, done) => {
        if (!profile.oid) {
            return done(new Error("No oid found"), null);
        }
        process.nextTick(function () {
            req.session.oid = profile.oid;
            req.session.upn = profile.upn;
            req.session.displayName = profile.displayName;
            req.session.firstName = profile.firstName;
            req.session.lastName = profile.lastName;
            req.session.groups = profile.groups;
            req.session.refreshToken = refreshToken;
            req.session.accessToken = accessToken;

            return done(null, profile);
        });
    });
}


export default { getOidcStrategy };