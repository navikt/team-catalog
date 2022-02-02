import { createProxyMiddleware } from 'http-proxy-middleware';
import setOnBehalfOfToken from '../auth/onbehalfof.js';

const scope = process.env.TEAM_CATALOG_SCOPE;

function setupProxy(app) {
    // Proxy endpoints
    app.use('/team-catalog',
        (req, res, next) => {
            setOnBehalfOfToken.addTokenToSession(req, res, next, scope)
        },
        createProxyMiddleware({
        target: process.env.TEAM_CATALOG_BACKEND_URL,
        changeOrigin: true,
            onProxyReq: function onProxyReq(proxyReq, req, res) {
                proxyReq.setHeader("authorization", "Bearer "+req.session[scope].accessToken)
            },
        pathRewrite: {
            [`^/team-catalog`]: ''
        },
        secure: true
    }));
}

export default setupProxy;