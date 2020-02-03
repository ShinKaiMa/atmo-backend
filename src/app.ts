import * as history from 'connect-history-api-fallback';
import * as bodyParser from 'body-parser';
import { config } from './config';
import { userController } from "./controller/user.controller"
import { dataStatusController } from "./controller/dataStatus.controller"
import express = require('express');
import * as cors from 'cors';
import * as helmet from 'helmet';
import * as dotenv from 'dotenv';
dotenv.config();

let app = express();
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

export default app;