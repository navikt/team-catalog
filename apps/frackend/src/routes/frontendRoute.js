import express from "express";
import path from "path";


const setupStaticRoutes = (app) => {
    app.use((req, res, next) => {
            if (req.isAuthenticated()) {
                next();
            } else {
                res.redirect('/login');
            }
        }, express.static('public')
    );

    app.get('*', (req, res) => {
        res.sendFile(path.resolve('./public') + "/index.html");
    });
}

export default { setupStaticRoutes };