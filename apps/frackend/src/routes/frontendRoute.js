import express from "express";


const setupStaticRoutes = (app) => {
    app.use((req, res, next) => {
            if (req.isAuthenticated()) {
                next();
            } else {
                res.redirect('/login');
            }
        }, express.static('public')
    );
}

export default { setupStaticRoutes };