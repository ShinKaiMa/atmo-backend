import express = require("express");
import { logger } from '../libs/utils/logger';
import { DataStatusService } from '../service/dataStatus.service';

let dataStatusController = express.Router();

dataStatusController.post("/api/modelView/schema", (req, res) => {
    logger.debug('get /api/modelView/schema - reqeust body :' + JSON.stringify(req.body));
    if (!req.body.modelName) {
        res.status(403).send({ Error: 'Invalid Params' });
        return;
    };

    DataStatusService.getModelViewSchemaByModelName(req.body.modelName, req.body.area).then(modelViewSchema => {
        if (!modelViewSchema) {
            res.status(403).send({ Error: 'Can not get model view schema.' });
            return;
        }
        res.json(modelViewSchema);
    }).catch(err => {
        res.status(503).send({ Error: 'Can not get model view schema.' })
    })
});

export { dataStatusController }
