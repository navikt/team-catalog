import { createProxyMiddleware } from 'http-proxy-middleware';

function setupProxy(app) {
    // Proxy endpoints
    app.use('/team-catalog', createProxyMiddleware({
        target: 'https://teamkatalog-api.dev.intern.nav.no',
        changeOrigin: true,
        onProxyReq: (proxyReq => proxyReq.removeHeader('authorization')),
        pathRewrite: {
            [`^/team-catalog`]: ''
        },
        secure: true
    }));
}

export default setupProxy;