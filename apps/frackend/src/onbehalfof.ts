import axios from "axios";
import { NextFunction, Request, Response } from "express";
import jose from "node-jose";
import { v4 as uuidv4 } from "uuid";

import config from "./config.js";
import { getTokenFromRequestHeader } from "./tokenValidation.js";

const azureAdHeaderConfig = {
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
};

export type OnBehalfOfResponse = {
  expires_in: number;
  access_token: string;
  refresh_token: string;
};

export async function addOnBehalfOfToken(
  request: Request,
  response: Response,
  next: NextFunction,
  scope: string,
) {
  const currentSession = request.session[scope];
  if (currentSession) {
    if (currentSession.expiresAt > Date.now() / 1000 + 10) {
      return next();
    }
    const token = await getRefreshToken(currentSession.refreshToken, scope);
    updateSession(request, scope, token);
    return next();
  }

  await getNewToken(request, response, next, scope);
  next();
}

async function getNewToken(
  request: Request,
  response: Response,
  next: NextFunction,
  scope: string,
) {
  const token = await getOnBehalfOfToken(request, scope);
  updateSession(request, scope, token);
}

const updateSession = (
  request: Request,
  scope: string,
  result: OnBehalfOfResponse,
) => {
  request.session[scope] = {
    expiresAt: Date.now() / 1000 + result.expires_in,
    accessToken: result.access_token,
    refreshToken: result.refresh_token,
  };
};

async function getOnBehalfOfToken(request: Request, scope: string) {
  const userAccessToken =
    getTokenFromRequestHeader(request) ??
    "Could not find authorization token in request";

  const parameters = new URLSearchParams();
  parameters.append(
    "grant_type",
    "urn:ietf:params:oauth:grant-type:jwt-bearer",
  );
  parameters.append("client_id", config.azureAd.clientId);
  parameters.append(
    "client_assertion_type",
    "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
  );
  parameters.append("requested_token_use", "on_behalf_of");
  parameters.append("scope", scope);
  parameters.append("assertion", userAccessToken);

  const clientAssertion = await generateClientAssertionToken();
  parameters.append("client_assertion", clientAssertion.toString());

  const tokenResponse = await axios.post<OnBehalfOfResponse>(
    config.azureAd.tokenEndpoint,
    parameters,
    azureAdHeaderConfig,
  );
  return tokenResponse.data;
}

function generateClientAssertionToken() {
  const bodyCnt = {
    sub: config.azureAd.clientId,
    aud: config.azureAd.issuer,
    nbf: Math.floor(Date.now() / 1000) - 30,
    iss: config.azureAd.clientId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
    jti: uuidv4(),
    iat: Math.floor(Date.now() / 1000) - 30,
  };

  return jose.JWS.createSign(
    {
      alg: "RS256",
      format: "compact",
    },
    JSON.parse(config.azureAd.jwk),
  )
    .update(JSON.stringify(bodyCnt), "utf8")
    .final();
}

async function getRefreshToken(refreshToken: string, scope: string) {
  const parameters = new URLSearchParams();
  parameters.append("grant_type", "refresh_token");
  parameters.append("client_id", config.azureAd.clientId);
  parameters.append(
    "client_assertion_type",
    "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
  );
  parameters.append("refresh_token", refreshToken);
  parameters.append("scope", scope);

  const clientAssertion = await generateClientAssertionToken();
  parameters.append("client_assertion", clientAssertion.toString());

  const tokenResponse = await axios.post<OnBehalfOfResponse>(
    config.azureAd.tokenEndpoint,
    parameters,
    azureAdHeaderConfig,
  );

  return tokenResponse.data;
}
