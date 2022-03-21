import { createProxyMiddleware } from 'http-proxy-middleware';
import setOnBehalfOfToken from '../auth/onbehalfof.js';
import config from "../config.js"

const scope = config.proxy.nomApiScope;

function setupNomApiProxy(app) {
    app.use('/nom-api',
        (req,res,next) => {
            if(req.originalUrl.startsWith("/nom-api/internal")){
                res.status(403).json("Forbidden")
            }
            next()
        },
        (req, res, next) => {
            setOnBehalfOfToken.addTokenToSession(req, res, next, scope)
        },
        createProxyMiddleware({
            target: config.proxy.nomApiUrl,
            changeOrigin: true,
            onProxyReq: function onProxyReq(proxyReq, req, res) {
                const accessToken = req.session[scope].accessToken;
                proxyReq.setHeader("Authorization", "Bearer " + accessToken)
            },
            pathRewrite: {
                ["^/nom-api"]: ""
            },
            secure: true
        }))
}

export default setupNomApiProxy;