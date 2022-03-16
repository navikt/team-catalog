import session from './session.js'
import passport from 'passport'
import openIdClientStrategy from './oidcStrategy.js'
import loginRoutes from '../routes/loginRoutes.js'
import RateLimit from 'express-rate-limit'

const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15,
})

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
    } else {
      const contentTypeHeader = req.header('Accept')
      const contentTypeHeaderStr = contentTypeHeader + ''
      if (contentTypeHeaderStr.includes('text/html')) {
        res.redirect(`/login?returnTo=${req.originalUrl}`)
      } else {
        res.status(401).json({message:'Unauthorized'})
      }
    }
  })
}

export default { setupAuth }
