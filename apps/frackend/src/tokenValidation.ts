import { expressjwt, GetVerificationKey } from "express-jwt";
import jwksRsa from "jwks-rsa";

import config from "./config.js";

export const verifyJWTToken = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: config.azureAd.openIdJwkUris,
  }) as GetVerificationKey,

  algorithms: ["RS256"],
  audience: config.azureAd.clientId,
  issuer: config.azureAd.issuer,
});
