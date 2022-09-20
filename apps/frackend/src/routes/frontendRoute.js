import express from "express";
import path from "path";
import * as fs from "fs";


const indexHtmlExists = fs.existsSync("./public/index.html");
const betaIndexHtmlExists = fs.existsSync("./public2/index.html")

const publicFolderPath = indexHtmlExists ? "./public" : "./publicLocal";
const betaPublicFolderPath = betaIndexHtmlExists ? "./public2" : "./publicLocal"

const webappStaticHandler = express.static(publicFolderPath);
const betaWebappStaticHandler = express.static(betaPublicFolderPath)

const checkBetaEnabledCookie = req => (req.headers.cookie || "").includes("BETA-ENABLED");

const setupStaticRoutes = (app) => {

    app.get("/beta-on",(req,res, next) => {
        res.cookie('BETA-ENABLED','ON')
        res.status(200).send('<a href="/">BETA-ENABLED</a>')
    })

    app.get("/beta-off",(req,res, next) => {
        res.clearCookie('BETA-ENABLED')
        res.status(200).send('<a href="/">BETA-DISABLED</a>')
    })

    app.use((req,res,next) => {
        if(checkBetaEnabledCookie(req)) {
            betaWebappStaticHandler(req,res,next)
        }else{
            webappStaticHandler(req,res,next)
        }
    })

    app.get('*', (req, res) => {
        if(checkBetaEnabledCookie(req)){
            res.sendFile(path.resolve(betaPublicFolderPath) + "/index.html")
        }else{
            res.sendFile(path.resolve(publicFolderPath) + "/index.html");
        }
    });
}

export default setupStaticRoutes;