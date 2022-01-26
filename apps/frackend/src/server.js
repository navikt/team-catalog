import express from 'express';
import setupProxy from './proxyApi.js'
//const actuators = require('./actuators.js')



// Create Express Server
const app = express();

app.use(express.static('public'))
setupProxy(app);

export default app;