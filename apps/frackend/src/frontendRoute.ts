import path from "node:path";

import { addServeSpaHandler, serveViteMode } from "@navikt/vite-mode";
import express, { Express } from "express";

export function setupStaticRoutes(app: Express) {
  app.use(express.static("./public", { index: false }));

  // When deployed, the built frontend is copied into the public directory. If running BFF locally the directory will not exist.
  const spaFilePath = path.resolve("./public", "index.html");

  serveViteMode(app, {
    setCSPHeaders: false,
    templateTransform: (origintalTemplate) => {
      const templateWithImportReplaced = origintalTemplate.replace(
        "import RefreshRuntime from 'http://localhost:$PATH/@react-refresh'",
        "import { injectIntoGlobalHook } from 'http://localhost:$PATH/@react-refresh'",
      );
      return templateWithImportReplaced.replace(
        "RefreshRuntime.injectIntoGlobalHook(window)",
        "injectIntoGlobalHook(window)",
      );
    },
  });

  addServeSpaHandler(app, spaFilePath);
}
