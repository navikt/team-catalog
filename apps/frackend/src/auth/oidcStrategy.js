import {OIDCStrategy} from "passport-azure-ad";
import config from "../config.js";

const getOidcStrategy = () => {
    return new OIDCStrategy({
        identityMetadata: config.azureAd.wellKnown,
        clientID: config.azureAd.clientId,
        responseType: 'code',
        responseMode: 'query',
        redirectUrl: config.azureAd.redirectUrl,
        allowHttpForRedirectUrl: process.env.NODE_ENV !== 'production',
        clientSecret: config.azureAd.clientSecret,
        passReqToCallback: true,
        validateIssuer: true,
        scope: ['profile', 'email', 'offline_access', config.azureAd.clientId+'/.default'],
        //loggingLevel: 'info',
        //loggingNoPII: false,
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