const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require("path");
const serveStatic = require("serve-static");
const { readFileSync } = require('fs');
const { setupFdk } = require("@gofynd/fdk-extension-javascript/express");
const mongoose = require('mongoose');
const Redis = require('ioredis');
const { MultiLevelStorage } = require('@gofynd/fdk-extension-javascript/express/storage');

const productRouter = express.Router();

mongoose.connect('mongodb://localhost:27017/extension-storage', {
    useUnifiedTopology: true,
    autoIndex: true, 
});

const redisClient = new Redis();

const fdkExtension = setupFdk({
    api_key: process.env.EXTENSION_API_KEY,
    api_secret: process.env.EXTENSION_API_SECRET,
    base_url: process.env.EXTENSION_BASE_URL,
    cluster: process.env.FP_API_DOMAIN,
    callbacks: {
        auth: async (req) => {
            if (req.query.application_id)
                return `${req.extension.base_url}/company/${req.query['company_id']}/application/${req.query.application_id}`;
            else
                return `${req.extension.base_url}/company/${req.query['company_id']}`;
        },
        uninstall: async (req) => {
            // Cleanup data related to extension
        }
    },
    storage: new MultiLevelStorage('example-fynd-platform-extension', redisClient, mongoose),
    access_mode: "online",
    webhook_config: {
        api_path: "/api/webhook-events",
        notification_email: "useremail@example.com",
        event_map: {
            "company/product/delete": {
                "handler": (eventName) => { console.log(eventName) },
                "version": '1'
            }
        }
    },
});

const STATIC_PATH = process.env.NODE_ENV === 'production'
    ? path.join(process.cwd(), 'frontend', 'public', 'dist')
    : path.join(process.cwd(), 'frontend');

const app = express();
const platformApiRoutes = fdkExtension.platformApiRoutes;

app.use(cookieParser("ext.session"));
app.use(bodyParser.json({ limit: '2mb' }));
app.use(serveStatic(STATIC_PATH, { index: false }));
app.use("/", fdkExtension.fdkHandler);

app.post('/api/webhook-events', async function(req, res) {
    try {
        console.log(`Webhook Event: ${req.body.event} received`);
        await fdkExtension.webhookRegistry.processWebhook(req);
        return res.status(200).json({"success": true});
    } catch (err) {
        console.log(`Error Processing ${req.body.event} Webhook`);
        return res.status(500).json({"success": false});
    }
});

productRouter.get('/', async function view(req, res, next) {
    try {
        const { platformClient } = req;
        const data = await platformClient.catalog.getProducts();
        return res.json(data);
    } catch (err) {
        next(err);
    }
});

productRouter.get('/application/:application_id', async function view(req, res, next) {
    try {
        const { platformClient } = req;
        const { application_id } = req.params;
        const data = await platformClient.application(application_id).catalog.getAppProducts();
        return res.json(data);
    } catch (err) {
        next(err);
    }
});

platformApiRoutes.use('/products', productRouter);
app.use('/api', platformApiRoutes);

app.get('*', (req, res) => {
    return res.status(200)
        .set("Content-Type", "text/html")
        .send(readFileSync(path.join(STATIC_PATH, "index.html")));
});

module.exports = app;
