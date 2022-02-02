import passport from "passport";
import session from "../auth/session.js";

const setupLoginRoutes = (app) => {
    app.use('^/login/aad/callback$',
        passport.authenticate('azureOidc', {failureRedirect: '/login'}),
        (req, res) => {
            if (session.redirectTo) {
                res.redirect(session.redirectTo);
            } else {
                res.redirect('/');
            }
        }
    );

    app.use("^/login$", passport.authenticate('azureOidc', {failureRedirect: '/login'}),
        (req, res) => {
            res.redirect('/')
        }
    );
}

export default { setupLoginRoutes };