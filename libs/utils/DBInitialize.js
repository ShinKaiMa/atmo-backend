const config = require("../../config");
var User = require('../../models/user');
const bcrypt = require('bcrypt');
var logger = require("./logger");

// initialize admin account in mongoDB

var isComplete = true;
async function DBinitialize() {
    logger.info('Start adding initial admin to DB');
    var adminList = config.adminList.admins;
    try {
        for (var admin of adminList) {
            var user = await User._getUserByEmail(admin.email);
            if (user) {
                logger.info(`${user.email} already existed in DB, skip it.`);
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

module.exports = DBinitialize;