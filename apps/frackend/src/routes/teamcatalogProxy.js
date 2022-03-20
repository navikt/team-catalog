import { createProxyMiddleware, fixRequestBody  } from 'http-proxy-middleware';
import setOnBehalfOfToken from '../auth/onbehalfof.js';
import config from "../config.js"

const scope = config.proxy.teamCatScope;

function setupTeamcatBackendProxy(app) {
    app.use('/team-catalog',
        (req,res,next) => {
            if(req.originalUrl.startsWith("/team-catalog/internal")){
                res.status(403).json("Forbidden")
            }
            next()
        },
        (req, res, next) => {
            setOnBehalfOfToken.addTokenToSession(req, res, next, scope)
        },
        createProxyMiddleware({
            target: config.proxy.teamCatBackendUrl,
            changeOrigin: true,
            onProxyReq: function onProxyReq(proxyReq, req, res) {
                proxyReq.setHeader("Authorization", "Bearer " + req.session[scope].accessToken)
                fixRequestBody(proxyReq,req)
            },
            pathRewrite: {
                [`^/team-catalog`]: ''
            },
            secure: true
        }))
}

export default setupTeamcatBackendProxy;