import passport from "passport";

function decodeReturnUri(req){
    try{
        const queryState = req.query.state
        const {returnTo} = JSON.parse(Buffer.from(queryState, 'base64').toString())
        if(returnTo.length > 1 && returnTo.substring(0,1) === "/" && returnTo.substring(1,2) !== "/"){
            return returnTo
        }
    }
    catch(e){}
    return "/"
}

function encodedStateWithReturnUri(req){
    const {returnTo} = req.query
    return returnTo ? (Buffer.from(JSON.stringify({returnTo})).toString("base64")) : undefined
}

const setupLoginRoutes = (app) => {
    app.use('^/login/aad/callback$',
        passport.authenticate('aadOidc', {failureRedirect: '/login'}),
        (req, res) => {
            res.redirect(decodeReturnUri(req))
        }
    );

    app.use("^/login$", function (req, res, next) {
            const encodedState = encodedStateWithReturnUri(req)
            const authCallback = passport.authenticate('aadOidc', {failureRedirect: '/login', state: encodedState})
            authCallback(req, res, next)
        },
        (req, res) => {
            res.redirect('/')
        }
    );
}

export default { setupLoginRoutes };