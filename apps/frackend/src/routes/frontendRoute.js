import express from "express";
import path from "path";
import * as fs from "fs";


const betaIndexHtmlExists = fs.existsSync("./public2/index.html")

const betaPublicFolderPath = betaIndexHtmlExists ? "./public2" : "./publicLocal"

const betaWebappStaticHandler = express.static(betaPublicFolderPath)


const setupStaticRoutes = (app) => {

    app.use((req,res,next) => {
        betaWebappStaticHandler(req,res,next)
    })

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(betaPublicFolderPath) + "/index.html")
    });
}

export default setupStaticRoutes;