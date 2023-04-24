'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require("path");

// import your routes here
const healthzRouter = require("./routes/healthz.router");
const v1Router = require("./routes/v1.router");


// initializing extension
const { setupFdk } = require("fdk-extension-javascript/express");
const { RedisStorage } = require("fdk-extension-javascript/express/storage");
const { appRedis } = require("./common/redis.init");

let fdkExtension = setupFdk({
    api_key: process.env.EXTENSION_API_KEY,
    api_secret: process.env.EXTENSION_API_SECRET,
    base_url: process.env.EXTENSION_BASE_URL,
    callbacks: {
        auth: async (req) => {
            // Write your code here to return initial launch url after auth process complete
            return `${req.extension.base_url}/company/${req.query['company_id']}`;
        },
        
        uninstall: async (req) => {
            // Write your code here to cleanup data related to extension
            // If task is time taking then process it async on other process.
        }
    },
    storage: new RedisStorage(appRedis,"exapmple-fynd-platform-extension"), // add your prefix
    access_mode: "offline",
    cluster: process.env.EXTENSION_CLUSTER_URL || "https://api.fynd.com" // this is optional by default it points to prod.
});


// initializing express app instance
const app = express();


app.use(cookieParser("ext.session"));
app.use(bodyParser.json({
    limit: '2mb'
}));

// register extension handlers
app.use("/", fdkExtension.fdkHandler);


app.use("/", healthzRouter);

// platform routes
const apiRoutes = fdkExtension.apiRoutes;
apiRoutes.use('/v1', v1Router)
app.use('/api', apiRoutes);


// application routes
const applicationProxyRoutes = fdkExtension.applicationProxyRoutes
app.use('/app', applicationProxyRoutes);


// serve extension frontend
app.use(express.static("dist"));
app.get('*', (req, res) => {
    res.contentType('text/html');
    res.sendFile(path.join(__dirname, '../', 'dist/index.html'))
});

module.exports = app;