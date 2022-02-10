import express from "express";
import path from "path";
import * as fs from "fs";


const indexHtmlExists = fs.existsSync("./public/index.html");
const publicFolderPath = indexHtmlExists ? "./public" : "./publicLocal";

const setupStaticRoutes = (app) => {
    app.use((req, res, next) => {
            if (req.isAuthenticated()) {
                next();
            } else {
                res.redirect('/login');
            }
        }, express.static(publicFolderPath)
    );

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(publicFolderPath) + "/index.html");
    });
}

export default { setupStaticRoutes };