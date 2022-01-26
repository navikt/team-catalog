import dotenv from "dotenv";
dotenv.config();
//import dotenv-expand from "dotenv-expand";
import app from "./server.js";

// Start the Proxy
app.listen(process.env.PORT, process.env.HOST, () => {
    console.log(`Starting Proxy at ${process.env.HOST}:${process.env.PORT}`);
});