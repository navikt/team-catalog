import { createProxyMiddleware } from 'http-proxy-middleware';

function setupProxy(app) {
    // Proxy endpoints
    app.use('/team-catalog', createProxyMiddleware({
        target: process.env.TARGET_URL,
        changeOrigin: true,
        onProxyReq: (proxyReq => proxyReq.removeHeader('authorization')),
        pathRewrite: {
            [`^/team-catalog`]: ''
        },
        secure: true
    }));
}

export default setupProxy;