import express from "express";

import { setupActuators } from "./actuators.js";
import { setupNomApiProxy, setupTeamcatApiProxy } from "./apiProxy.js";
import setupStaticRoutes from "./frontendRoute.js";
import { setupSession } from "./session.js";
import setupUiDevelopmentEndpoint from "./uiDev.js";

// Create Express Server
const app = express();

// Restricts the server to only accept UTF-8 encoding of bodies
app.use(express.urlencoded({ extended: true }));

setupActuators(app);
setupSession(app);

setupNomApiProxy(app);
setupTeamcatApiProxy(app);

setupUiDevelopmentEndpoint(app);

// Catch all route, må være sist
setupStaticRoutes(app);

export default app;
