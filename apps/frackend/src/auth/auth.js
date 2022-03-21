import session from './session.js'
import passport from 'passport'
import openIdClientStrategy from './oidcStrategy.js'
import loginRoutes from '../routes/loginRoutes.js'
import RateLimit from 'express-rate-limit'
import config from '../config.js'

function ingressIsDeprecated(reqHostName){
    const isLocalhost = reqHostName.includes("localhost")
    const matchesDefaultBaseUrl = ("https://" + reqHostName) === config.app.defaultBaseUrl
    return !(isLocalhost || matchesDefaultBaseUrl)
}

const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15,
})

function handleUnauthenticated(req,res){
    const reqHost = req.header('Host')
    if (ingressIsDeprecated(reqHost)) {
      res.redirect(config.app.defaultBaseUrl + req.originalUrl)
      return;
    }
    const contentTypeHeader = req.header('Accept')
    const contentTypeHeaderStr = contentTypeHeader + ''
    if (contentTypeHeaderStr.includes('text/html')) {
      res.redirect(`/login?returnTo=${req.originalUrl}`)
      return
    }
    res.status(401).json({message: 'Unauthorized'})
}

const setupAuth = async (app) => {
    app.use('/login', limiter)

    session.setup(app)
    passport.use('aadOidc', openIdClientStrategy.strategy)
    passport.serializeUser((user, done) => done(null, user))
    passport.deserializeUser((user, done) => done(null, user))
    app.use(passport.initialize())
    app.use(passport.session(session))

    loginRoutes.setupLoginRoutes(app)

    app.use((req, res, next) => {
        if (req.isAuthenticated()) {
            next()
            return
        }
        handleUnauthenticated(req, res)
    })
}

export default { setupAuth }
