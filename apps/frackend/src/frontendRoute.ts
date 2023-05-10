import * as fs from "node:fs";
import path from "node:path";

import express, { Express } from "express";

const indexHtmlExists = fs.existsSync("./public/index.html");
const publicFolderPath = indexHtmlExists ? "./public" : "./publicLocal";

const setupStaticRoutes = (app: Express) => {
  app.use(express.static(publicFolderPath));

  app.get("*", (request, response) => {
    response.sendFile(path.resolve(publicFolderPath) + "/index.html");
  });
};

export default setupStaticRoutes;
