'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require("path");

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
    storage: new RedisStorage(appRedis,"example-fynd-platform-extension"), // add your prefix
    access_mode: "online",
    cluster: process.env.EXTENSION_CLUSTER_URL || "https://api.fynd.com"
});


// initializing express app instance
const app = express();


app.use(cookieParser("ext.session"));
app.use(bodyParser.json({
    limit: '2mb'
}));

// register extension handlers
app.use("/", fdkExtension.fdkHandler);


// platform routes
const apiRoutes = fdkExtension.apiRoutes;
apiRoutes.get('/applications', async function view(req, res, next) {
    try {
        const {
            platformClient
        } = req;
        return res.json(await platformClient.configuration.getApplications({
            pageSize: 1000,
            q: JSON.stringify({"is_active": true})
        }));
    } catch (err) {
        next(err);
    }
});

app.use('/api/v1', apiRoutes);


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