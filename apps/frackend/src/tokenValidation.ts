import { getToken, validateToken } from "@navikt/oasis";
import { NextFunction, Request, Response } from "express";
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

export const verifyToken = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const token = getToken(request);
  if (!token) {
    return response.status(401).send();
  }

  const validation = await validateToken(token);
  if (!validation.ok) {
    return response.status(403).send();
  }

  return next();
};
