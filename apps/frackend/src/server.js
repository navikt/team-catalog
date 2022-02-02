import express from 'express';
import setupProxy from './routes/teamcatalogProxy.js';
import setupAcuators from './routes/actuators.js';
import setupAuth from './auth/auth.js';
import frontendRoute from "./routes/frontendRoute.js";


// Create Express Server
const app = express();

// Restricts the server to only accept json payloads
app.use(express.json());

// Restricts the server to only accept UTF-8 encoding of bodies
app.use(express.urlencoded({ extended: true}));

// Introduces session storage and session cookies for clients on any endpoint.
setupAuth.setupAuth(app);


setupProxy(app);
setupAcuators(app)
frontendRoute.setupStaticRoutes(app);

export default app;