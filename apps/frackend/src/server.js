import express from 'express';
import {nomApiSetupProxy, teamcatApiSetupProxy} from "./routes/apiProxy.js";
import setupAcuators from './routes/actuators.js';
import setupAuth from './auth/auth.js';
import setupStaticRoutes from "./routes/frontendRoute.js";
import cors from "cors";
import config from "./config.js";

// Create Express Server
const app = express();

// Restricts the server to only accept json payloads
app.use(express.json());

// Restricts the server to only accept UTF-8 encoding of bodies
app.use(express.urlencoded({ extended: true}));

if(!config.app.isProd){
    app.use(cors({
        origin: [3000,8080,8082].map(it => "http://localhost:" + it)
    }));
}

setupAcuators(app)

// Introduces session storage and session cookies for clients on any endpoint.
await setupAuth.setupAuth(app);

teamcatApiSetupProxy(app);

nomApiSetupProxy(app);

setupStaticRoutes(app);

export default app;