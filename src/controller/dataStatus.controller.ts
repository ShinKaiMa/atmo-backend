import express = require("express");
import { logger } from '../libs/utils/logger';
import { DataStatusService } from '../service/dataStatus.service';
import { config } from '../config'

let dataStatusController = express.Router();

dataStatusController.post("/api/modelView/schema", (req, res) => {
    logger.debug('get /api/modelView/schema - reqeust body :' + JSON.stringify(req.body));
    if (!req.body.model || !req.body.area) {
        res.status(403).send({ Error: 'Invalid Params' });
        return;
    };

    DataStatusService.getModelViewSchemaByAreaAndModelName(req.body.model, req.body.area.replace(/ /g,'_')).then(modelViewSchema => {
        if (!modelViewSchema) {
            res.status(403).send({ Error: 'Can not get model view schema (empty).' });
            return;
        }
        res.json(modelViewSchema);
    }).catch(err => {
        res.status(503).send({ Error: 'Can not get model view schema.' })
    })
});

dataStatusController.post("/api/modelView/area", (req, res) => {
    logger.debug('get /api/modelView/area - reqeust body :' + JSON.stringify(req.body));
    if (!req.body.model) {
        res.status(403).send({ Error: 'Invalid Params' });
        return;
    };

    DataStatusService.getAreaByModel(req.body.model).then(areas => {
        if (!areas) {
            res.status(403).send({ Error: 'Can not get areas (empty).' });
            return;
        }
        res.json(areas);
    }).catch(err => {
        logger.error(err);
        res.status(503).send({ Error: 'Can not get areas.' })
    })
});

dataStatusController.post('/api/modelView/weathermap', (req, res) => {
    logger.debug('get /api/modelView/weathermap - reqeust body :' + JSON.stringify(req.body));
    if (!req.body.model || !req.body.area || !req.body.detailType || !req.body.startDateString) {
        res.status(403).send({ Error: 'Invalid Params' });
        return;
    };
    DataStatusService.getWeathermap(
        req.body.model,
        req.body.area,
        req.body.detailType,
        req.body.startDateString).then(result => {
            res.json(result);
        }).catch(err => {
            logger.error(err);
            res.status(503).send({ Error: 'Can not get areas.' })
        });
})

export { dataStatusController }
