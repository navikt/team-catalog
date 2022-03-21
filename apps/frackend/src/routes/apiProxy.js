import {createProxyMiddleware, fixRequestBody} from 'http-proxy-middleware';
import setOnBehalfOfToken from '../auth/onbehalfof.js';
import config from "../config.js"

function reqHasAcceptedContentType(req){
    const contentTypeStr = req.header("Content-Type").toLowerCase();
    const acceptedCharsetStrs = ["charset=utf-8","charset=utf8"];
    acceptedCharsetStrs.forEach(str => {
        if(contentTypeStr.includes(str)) return true;
    })
    return false;
}

function _setupProxy(app,proxyPath,scope,apiTargetUrl){
    app.use(proxyPath,
        (req,res,next) => {
            if(req.originalUrl.startsWith(proxyPath + "/internal")){
                res.status(403).json("Forbidden")
            }
            next()
        },
        (req, res, next) => {
            setOnBehalfOfToken.addTokenToSession(req, res, next, scope)
        },
        createProxyMiddleware({
            target: apiTargetUrl,
            changeOrigin: true,
            onProxyReq: function onProxyReq(proxyReq, req, res) {
                proxyReq.setHeader("Authorization", "Bearer " + req.session[scope].accessToken)
                if(["POST","PUT"].includes(req.method) && !reqHasAcceptedContentType(req)){
                    console.warn("Missing charset in content-type header for proxied POST/PUT!")
                    fixRequestBody(proxyReq,req)
                }
            },
            pathRewrite: {
                ["^" + proxyPath]: ""
            },
            secure: true
        }))
}

const nomApiSetupProxy = (app) => _setupProxy(app,'/nom-api',config.proxy.nomApiScope,config.proxy.nomApiUrl)

const teamcatApiSetupProxy = (app) => _setupProxy(app,'/team-catalog',config.proxy.teamCatScope,config.proxy.teamCatBackendUrl)

export {teamcatApiSetupProxy, nomApiSetupProxy}