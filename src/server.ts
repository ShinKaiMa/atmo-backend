'use strict'
import * as history from 'connect-history-api-fallback';
import {config} from './config';
import {logger} from './libs/utils/logger';
import {DBinitialize} from './libs/utils/DBInitialize';
import {User} from './models/user';
const path = require('path')
const express = require('express');
var bodyParser = require('body-parser');
const mongoose = require("mongoose");
var app = express();


// use createIndex() instead of ensureIndex() in mongodb
mongoose.set('useCreateIndex', true);
mongoose.connect(config.database, { useNewUrlParser: true })
    .then(() => {
        logger.info(`Connected to ${config.database} successfully`);
        DBinitialize();
    })
    .catch((error) => {
        logger.error(`Can not connect to ${config.database}, reason: ` + error);
        process.exit(1);
    });

app.use(history());
app.use(express.static(path.join(__dirname, 'dist')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/api/login", (req, res) => {
    logger.info('get login reqeust -  email:' + JSON.stringify(req.body.email));
    var user = new User({
        email: req.body.email,
        password: req.body.password
    });
    user.verify().then((result) => {
        res.json(result)
    }).catch((error) => {
        res.status(500).json({ Error: error });
    })
        ;
})

app.listen(80, () => {
    logger.info('running at port 80');
})