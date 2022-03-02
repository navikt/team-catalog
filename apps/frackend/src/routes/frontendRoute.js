import express from "express";
import path from "path";
import * as fs from "fs";


const indexHtmlExists = fs.existsSync("./public/index.html");
const publicFolderPath = indexHtmlExists ? "./public" : "./publicLocal";

const setupStaticRoutes = (app) => {

    app.use(express.static(publicFolderPath))

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(publicFolderPath) + "/index.html");
    });
}

export default setupStaticRoutes;