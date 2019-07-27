import express = require("express");
import { logger } from '../libs/utils/logger';
import { userService } from '../service/user.service';

let userController = express.Router();

userController.post("/api/login", (req, res) => {
    logger.info('get login reqeust -  email:' + JSON.stringify(req.body.email));
    userService.verify(req.body.email, req.body.password).then((response) => res.json(response));
});

export { userController }
