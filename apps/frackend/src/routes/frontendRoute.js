import express from "express";
import path from "path";
import * as fs from "fs";


const indexHtmlExists = fs.existsSync("./public/index.html");
const betaIndexHtmlExists = fs.existsSync("./public2/index.html")

const publicFolderPath = indexHtmlExists ? "./public" : "./publicLocal";
const betaPublicFolderPath = betaIndexHtmlExists ? "./public2" : "./publicLocal"

const webappStaticHandler = express.static(publicFolderPath);
const betaWebappStaticHandler = express.static(betaPublicFolderPath)

const checkBetaEnabledCookieOrIngress = req => req.host.includes("-beta.")
    || (req.headers.cookie || "").includes("BETA-ENABLED");

const setupStaticRoutes = (app) => {

    app.get("/beta-on",(req,res, next) => {
        res.cookie('BETA-ENABLED','ON')
        res.redirect("/");
    })

    app.get("/beta-off",(req,res, next) => {
        res.clearCookie('BETA-ENABLED')
        res.redirect("/");
    })

    app.use((req,res,next) => {
        if(checkBetaEnabledCookieOrIngress(req)) {
            betaWebappStaticHandler(req,res,next)
        }else{
            webappStaticHandler(req,res,next)
        }
    })

    app.get('*', (req, res) => {
        if(checkBetaEnabledCookieOrIngress(req)){
            res.sendFile(path.resolve(betaPublicFolderPath) + "/index.html")
        }else{
            res.sendFile(path.resolve(publicFolderPath) + "/index.html");
        }
    });
}

export default setupStaticRoutes;