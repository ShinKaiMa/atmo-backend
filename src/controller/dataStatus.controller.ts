import express = require("express");
import { logger } from '../libs/utils/logger';
import { DataStatusService } from '../service/dataStatus.service';

let dataStatusController = express.Router();

dataStatusController.post("/api/modelView/schema", async(req, res) => {
    logger.debug('get /api/modelView/schema - reqeust body :' + JSON.stringify(req.body));
    let modelViewSchema = await DataStatusService.getModelViewSchemaByModelName(req.body.modelName);
    res.json(modelViewSchema);
});

export { dataStatusController }
