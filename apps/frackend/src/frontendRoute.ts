import * as fs from "node:fs";
import path from "node:path";

import express, { Express, Response } from "express";

// When deployed the built frontend is copied into the public directory. If running BFF locally the directory will not exist.
const productionBuildExists = fs.existsSync("./public/index.html");

export function setupStaticRoutes(app: Express) {
  app.use(express.static("./public"));

  app.get("/toggle-devserver", (request, response) => {
    const developmentServerShouldBeEnabled =
      request.cookies["use-local-devserver"] !== "true";
    response.cookie("use-local-devserver", developmentServerShouldBeEnabled, {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
    });

    developmentServerShouldBeEnabled
      ? serveDevserver(response)
      : serveProductionBuild(response);
  });

  app.get("*", (request, response) => {
    const developmentServerIsEnabled =
      request.cookies["use-local-devserver"] === "true";

    if (developmentServerIsEnabled || !productionBuildExists) {
      return serveDevserver(response);
    }
    return serveProductionBuild(response);
  });
}

function serveDevserver(response: Response) {
  response.sendFile(path.resolve("./dev-server") + "/index.html");
}

function serveProductionBuild(response: Response) {
  response.sendFile(path.resolve("./public") + "/index.html");
}
