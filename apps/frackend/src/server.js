import express from 'express';
import setupProxy from './proxyApi.js'
import setupAcuators from './actuators.js'
//const actuators = require('./actuators.js')



// Create Express Server
const app = express();

app.use(express.static('public'))
setupProxy(app);
setupAcuators(app)

export default app;