import config from "./config.js";
import app from "./server.js";


// Start the Proxy
app.listen(process.env.PORT || 3000, process.env.HOST || '0.0.0.0', () => {
    console.log(`Starting Proxy at ${process.env.HOST}:${process.env.PORT}`);
});