import express = require("express");
import { logger } from '../libs/utils/logger';
import { UserService } from '../service/user.service';

let userController = express.Router();

userController.post("/api/login", (req, res) => {
    logger.info('get login reqeust -  email:' + JSON.stringify(req.body.email));
    UserService.verify(req.body.email, req.body.password).then((response) => res.json(response)).catch( err => {
        logger.error(err);
        res.status(503).send({ Error: 'Can not verify.' });
    });
});

export { userController }
