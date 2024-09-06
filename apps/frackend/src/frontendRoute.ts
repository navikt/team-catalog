import path from "node:path";

import { addServeSpaHandler, serveViteMode } from "@navikt/vite-mode";
import express, { Express } from "express";

export function setupStaticRoutes(app: Express) {
  app.use(express.static("./public", { index: false }));

  // When deployed, the built frontend is copied into the public directory. If running BFF locally the directory will not exist.
  const spaFilePath = path.resolve("./public", "index.html");

  serveViteMode(app, {});

  addServeSpaHandler(app, spaFilePath);
}
