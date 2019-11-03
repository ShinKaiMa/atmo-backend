import express = require("express");
import { logger } from '../libs/utils/logger';

let dataStatusController = express.Router();

dataStatusController.post("/api/modelView/schema", (req, res) => {
    logger.info('get reqeust -  model:' + JSON.stringify(req.body.email));
    
});

export { dataStatusController }
