'use strict'
import * as history from 'connect-history-api-fallback';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import { config } from './config';
import { logger } from './libs/utils/logger';
import { DBinitialize } from './libs/utils/DBInitialize';
import {userController} from "./controller/user.controller"
import express = require('express');
import mongoose = require('mongoose');

let app = express();

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

app.use("/",userController);

app.listen(80, () => {
    logger.info('running at port 80');
})