const { createProxyMiddleware } = require("http-proxy-middleware");

// Used in local development server only
module.exports = function(app) {
  const target = "https://teamkatalog-api.nais.preprod.local";
  const headers = {
    "Nav-Consumer-Id": "teamsfrontend-local"
  };

  app.use(
    "/api",
    createProxyMiddleware({
      pathRewrite: {
        "^/api": ""
      },
      target,
      headers,
      secure: false
    })
  );

  app.use("/login", createProxyMiddleware({ target, headers }));
  app.use("/logout", createProxyMiddleware({ target, headers }));
};
