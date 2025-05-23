import express from "express";
import helmet from "helmet";

import { setupActuators } from "./actuators.js";
import { setupNomApiProxy, setupTeamcatApiProxy } from "./apiProxy.js";
import { errorHandling } from "./errorHandler.js";
import { setupStaticRoutes } from "./frontendRoute.js";
import { verifyToken } from "./tokenValidation.js";
import { setupUnleashProxy } from "./unleash.js";

const app = express();
app.use(helmet());

// Restricts the server to only accept UTF-8 encoding of bodies
app.use(express.urlencoded({ extended: true }));

setupActuators(app);

app.set("trust proxy", 1);

app.use(verifyToken);

setupNomApiProxy(app);
setupTeamcatApiProxy(app);
setupUnleashProxy(app);

// Catch all route, må være sist
setupStaticRoutes(app);

app.use(errorHandling);

export default app;
