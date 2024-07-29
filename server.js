const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require("path");
const productRouter = require("./product.router");
const { setupFdk } = require("fdk-extension-javascript/express");
const { SQLiteStorage } = require("fdk-extension-javascript/express/storage");
const { sqliteInstance } = require("./sqlite.init");

const fdkExtension = setupFdk({
    api_key: process.env.EXTENSION_API_KEY,
    api_secret: process.env.EXTENSION_API_SECRET,
    base_url: process.env.EXTENSION_BASE_URL,
    callbacks: {
        auth: async (req) => {
            // Write you code here to return initial launch url after auth process complete
            if (req.query.application_id)
                return `${req.extension.base_url}/company/${req.query['company_id']}/application/${req.query.application_id}`;
            else
                return `${req.extension.base_url}/company/${req.query['company_id']}`;
        },
        
        uninstall: async (req) => {
            // Write your code here to cleanup data related to extension
            // If task is time taking then process it async on other process.
        }
    },
    storage: new SQLiteStorage(sqliteInstance,"exapmple-fynd-platform-extension"), // add your prefix
    access_mode: "online"
});

const app = express();
const healthzRouter = express.Router();
const platformApiRoutes = fdkExtension.platformApiRoutes;

// Middleware to parse cookies with a secret key
app.use(cookieParser("ext.session"));

// Middleware to parse JSON bodies with a size limit of 2mb
app.use(bodyParser.json({
    limit: '2mb'
}));

// Health check route
healthzRouter.get('/_healthz', (req, res, next) => {
    res.json({
        "ok": "ok"
    });
});

healthzRouter.get('/_readyz', (req, res, next) => {
    res.json({
        "ok": "ok"
    });
});
app.use("/", healthzRouter);

// Serve static files from the Vue dist directory
app.use(express.static("../dist"));

// FDK extension handler and API routes (extension launch routes)
app.use("/", fdkExtension.fdkHandler);

// FDK extension api route which has auth middleware and FDK client instance attached to it.
platformApiRoutes.use('/products', productRouter);
app.use('/api', platformApiRoutes);

// Serve the Vue app for all other routes
app.get('*', (req, res) => {
    res.contentType('text/html');
    res.sendFile(path.join(__dirname, '../', 'dist/index.html'));
});

module.exports = app;