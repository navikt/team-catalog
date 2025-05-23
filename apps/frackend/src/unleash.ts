import { Express } from "express";
import { initialize } from "unleash-client";

import config from "./config.js";

const unleash = initialize({
  url: config.unleash.url + "/api",
  appName: "team-catalog-frackend",
  customHeaders: { Authorization: config.unleash.token },
});

function navidentFromHeader(
  authHeader: string | undefined,
): string | undefined {
  if (!authHeader) {
    return;
  }
  const jwt = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : undefined;
  if (!jwt) {
    return;
  }
  try {
    const jwtClaimsBase64 = jwt.split(".")[1];
    const jwtClaimsString = Buffer.from(jwtClaimsBase64, "base64") + "";
    const jwtClaims = JSON.parse(jwtClaimsString);
    const navIdent = jwtClaims["NAVident"];
    return navIdent ?? undefined;
  } catch {
    return;
  }
}

export const setupUnleashProxy = (app: Express) => {
  app.get("/frackend/unleash/:flagName", (request, response) => {
    const flagName = request.params.flagName;
    const isUnleashEnabled = unleash.isEnabled(flagName, {
      userId: navidentFromHeader(request.headers.authorization),
    });
    response.send({ isUnleashEnabled });
  });
};
