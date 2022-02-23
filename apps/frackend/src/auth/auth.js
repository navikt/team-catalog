import session from "./session.js";
import passport from "passport";
import oidcStrategy from "./oidcStrategy.js";
import loginRoutes from "../routes/loginRoutes.js";

const setupAuth = (app) => {
    session.setup(app);
    passport.use('azureOidc', oidcStrategy.getOidcStrategy())
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user));
    app.use(passport.initialize());
    app.use(passport.session(session));

    loginRoutes.setupLoginRoutes(app);

    app.use((req, res, next) => {
        if (req.isAuthenticated()) {
            next();
        } else {
            const contentTypeHeader = req.header("Accept");
            const contentTypeHeaderStr = contentTypeHeader + "";
            if(contentTypeHeaderStr.includes("text/html")){
                res.redirect('/login');
            }else {
                res.send(401,"Unauthorized");
            }
        }
    })
}

export default { setupAuth };