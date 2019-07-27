import {config} from '../../config';
import {logger} from '../../libs/utils/logger';
import {User} from '../../models/user.model';
const bcrypt = require('bcrypt');

// initialize admin account in mongoDB

export const DBinitialize = async function() {
    var isComplete = true;
    logger.info('Start adding initial admin to DB');
    var adminList = config.adminList.admins;
    try {
        for (var admin of adminList) {
            let user = await User.findOne({ email: admin.email }).exec();
            if (user) {
                logger.debug(`${user.email} already existed in DB, skip it.`);
                continue;
            } else {
                var hash = await bcrypt.hash(admin.password, config.saltRounds);
                admin.password = hash;
                admin.auth = true;
                admin.admin = true;
                var newAdmin = new User(admin);
                await newAdmin.save();
                logger.info(`added ${JSON.stringify(admin)} to DB successfully`);
            }
        }
    }
    catch (error) {
        logger.error('DB Initialize fail. Please check DB connection. Reason: ' + error);
        isComplete=false;
    }finally{
        if(isComplete) logger.info('DB has initialized!');
    }
}