'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require("path");
const healthzRouter = require("./routes/healthz.router");
const v1Router = require("./routes/v1.router");
const fdkExtension = require("./fdk");
const app = express();
app.use(cookieParser("ext.session"));
app.use(bodyParser.json({
    limit: '2mb'
}));
app.get('/env.js', (req, res) => {
    const commonEnvs = {
        base_url: config.extension.base_url
    }
    res.type('application/javascript');
    res.send(
      `window.env = ${JSON.stringify(
        commonEnvs,
        null,
        4
      )}`
    );
});
app.use("/", healthzRouter);
app.use(express.static("dist"));
app.use("/", fdkExtension.fdkHandler);
const apiRoutes = fdkExtension.apiRoutes;
apiRoutes.use('/v1.0', v1Router);
app.use('/api', apiRoutes);

app.get('*', (req, res) => {
    res.contentType('text/html');
    res.sendFile(path.join(__dirname, '../', 'dist/index.html'))
});

module.exports = app;