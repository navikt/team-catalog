import { Express } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

import config from "./config.js";
import { addOnBehalfOfToken } from "./onbehalfof.js";
import { getOboTokenForRequest } from "./sessionCache.js";
import { verifyJWTToken } from "./tokenValidation.js";

function setupProxy(
  server: Express,
  ingoingUrl: string,
  outgoingUrl: string,
  scope: string,
) {
  server.use(
    ingoingUrl,
    verifyJWTToken,
    (request, response, next) =>
      addOnBehalfOfToken(request, response, next, scope),
    createProxyMiddleware({
      target: outgoingUrl,
      changeOrigin: true,
      logger: console,
      on: {
        proxyReq: (proxyRequest, request) => {
          const accessToken = getOboTokenForRequest(request, scope)
            ?.accessToken;
          if (accessToken) {
            proxyRequest.setHeader("Authorization", `Bearer ${accessToken}`);
          } else {
            console.log(
              `Access token var not present in session for scope ${scope}`,
            );
          }
        },
      },
    }),
  );
}

export const setupNomApiProxy = (app: Express) =>
  setupProxy(app, "/nom-api", config.proxy.nomApiUrl, config.proxy.nomApiScope);

export const setupTeamcatApiProxy = (app: Express) =>
  setupProxy(
    app,
    "/team-catalog",
    config.proxy.teamcatApiUrl,
    config.proxy.teamcatApiScope,
  );
