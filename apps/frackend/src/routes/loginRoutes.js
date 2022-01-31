import passport from "passport";
import session from "../auth/session.js";

const setupLoginRoutes = (app) => {
    app.use('^/login/aad/callback$',

        (req, res, next) => {
            console.log('callback');
            next();
        },
        passport.authenticate('azureOidc', {failureRedirect: '/login'}),
        (req, res) => {
            if (session.redirectTo) {
                console.log(session.redirectTo);
                res.redirect(session.redirectTo);
            } else {
                res.redirect('/');
            }
        }
        /*(req, res, next) => {
            console.log(req.query.code);
            if(req.query.code){
                next();
            }
            else {
                res.redirect('/login');
            }
        },
        (req, res, next) => {
            var reddirectUrl = (req.originalUrl.includes('/login')) ? '/' : req.originalUrl;
            res.redirect(reddirectUrl);
        }*/
    );

    app.use("^/login$", passport.authenticate('azureOidc', {failureRedirect: '/login'}),
        (req, res) => {
            res.redirect('/')
        }
    );
}

export default { setupLoginRoutes };