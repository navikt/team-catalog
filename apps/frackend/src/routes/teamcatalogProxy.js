import { createProxyMiddleware } from 'http-proxy-middleware';
import setOnBehalfOfToken from '../auth/onbehalfof.js';
import config from "../config.js"

const scope = config.proxy.teamCatScope;

function setupTeamcatBackendProxy(app) {
    app.use('/team-catalog',
        (req, res, next) => {
            setOnBehalfOfToken.addTokenToSession(req, res, next, scope)
        },
        createProxyMiddleware({
            target: config.proxy.teamCatBackendUrl,
            changeOrigin: true,
            onProxyReq: function onProxyReq(proxyReq, req, res) {
                proxyReq.setHeader("Authorization", "Bearer " + req.session[scope].accessToken)
            },
            pathRewrite: {
                [`^/team-catalog`]: ''
            },
            secure: true
        }))
}

export default setupTeamcatBackendProxy;