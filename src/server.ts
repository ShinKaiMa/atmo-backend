'use strict'
import * as history from 'connect-history-api-fallback';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import { config } from './config';
import { logger } from './libs/utils/logger';
import { DBinitialize } from './libs/utils/DBInitialize';
import { userController } from "./controller/user.controller"
import { dataStatusController } from "./controller/dataStatus.controller"
import express = require('express');
import mongoose = require('mongoose');
import * as cors from 'cors';
import * as helmet from 'helmet';
import * as dotenv from 'dotenv';
dotenv.config();

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

app.use(cors({
    origin: config.corsOrigin,
    optionsSuccessStatus: 200
}));
app.use(history());
app.use(config.weathermapRoute, express.static(process.env.LOCAL_STATIC_IMG_PATH));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(helmet());

app.use("/", userController);
app.use("/", dataStatusController);
let server = app.listen(config.port, () => {
    logger.info(`running at port ${config.port}, base URL: ${config.baseURL}`);
    logger.info(`using  CORS-ORIGIN domain: [${config.corsOrigin}]`);
    logger.info(`using local static image path: [${process.env.LOCAL_STATIC_IMG_PATH}], route: [${config.baseURL+config.weathermapRoute}]`);
})

export {app, server};