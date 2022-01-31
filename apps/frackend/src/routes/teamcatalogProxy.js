import { createProxyMiddleware } from 'http-proxy-middleware';
import setOnBehalfOfToken from '../auth/onbehalfof.js';

function setupProxy(app) {
    // Proxy endpoints
    app.use('/team-catalog',
        (req, res, next) => {
            setOnBehalfOfToken.setOnBehalfOfToken(req, 'dev-fss:nom:team-catalog')
        },
        createProxyMiddleware({
        target: process.env.TEAM_CATALOG_BACKEND_URL,
        changeOrigin: true,
        onProxyReq: (proxyReq => proxyReq.removeHeader('authorization')),
        pathRewrite: {
            [`^/team-catalog`]: ''
        },
        secure: true
    }));
}

export default setupProxy;