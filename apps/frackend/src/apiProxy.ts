import { getToken, requestOboToken } from "@navikt/oasis";
import { Express, NextFunction, Request, Response } from "express";
import {
  createProxyMiddleware,
  responseInterceptor,
} from "http-proxy-middleware";

import config from "./config.js";

type ProxyOptions = {
  ingoingUrl: string;
  outgoingUrl: string;
  scope: string;
};

export const setupNomApiProxy = (app: Express) =>
  addProxyHandler(app, {
    ingoingUrl: "/frackend/nom-api",
    outgoingUrl: config.proxy.nomApiUrl,
    scope: config.proxy.nomApiScope,
  });

export const setupTeamcatApiProxy = (app: Express) =>
  addProxyHandler(app, {
    ingoingUrl: "/frackend/team-catalog",
    outgoingUrl: config.proxy.teamcatApiUrl,
    scope: config.proxy.teamcatApiScope,
  });

export function addProxyHandler(
  server: Express,
  { ingoingUrl, outgoingUrl, scope }: ProxyOptions,
) {
  server.use(
    ingoingUrl,
    async (request: Request, response: Response, next: NextFunction) => {
      const token = getToken(request);
      if (!token) {
        response.status(401).send();
        return;
      }
      const obo = await requestOboToken(token, scope);
      if (obo.ok) {
        request.headers["obo-token"] = obo.token;
        return next();
      } else {
        response.status(403).send();
        return;
      }
    },
    createProxyMiddleware({
      target: outgoingUrl,
      changeOrigin: true,
      logger: console,
      selfHandleResponse: true,
      on: {
        proxyReq: (proxyRequest, request) => {
          const obo = request.headers["obo-token"];
          if (obo) {
            proxyRequest.removeHeader("obo-token");
            proxyRequest.removeHeader("cookie");
            proxyRequest.setHeader("Authorization", `Bearer ${obo}`);
          } else {
            console.log(
              `Access token var not present in session for scope ${scope}`,
            );
          }
        },
        proxyRes: responseInterceptor(
          async (responseBuffer, proxyResponse, request, response) => {
            if (response.statusCode === 400) {
              console.log(
                "[400 RESPONSE] contentType",
                proxyResponse.headers["content-type"],
              );
              console.log(
                "[400 RESPONSE] toString",
                responseBuffer.toString("utf8"),
              );

              console.log(
                "[400 RESPONSE] header info",
                new Blob(request.rawHeaders).size,
              );
              if (
                proxyResponse.headers["content-type"] === "application/json"
              ) {
                const data = JSON.parse(responseBuffer.toString("utf8"));

                console.log("[400 RESPONSE] DATA", data);

                return JSON.stringify(data);
              }
            }

            return responseBuffer;
          },
        ),
      },
    }),
  );
}
