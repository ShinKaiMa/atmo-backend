import { config } from '../../config';
import { logger } from './logger';
import { User } from '../../models/user.model';
import mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// initialize admin account in mongoDB
const DBinitialize = async () => {
    let isComplete = true;
    logger.info('Start adding initial admin to DB');
    let adminList = config.adminList.admins;
    try {
        for (var admin of adminList) {
            let user = await User.findOne({ email: admin.email }).exec();
            if (user) {
                logger.debug(`${user.email} already existed in DB, skip it.`);
                continue;
            } else {
                let hash = await bcrypt.hash(admin.password, config.saltRounds);
                admin.password = hash;
                admin.auth = true;
                admin.admin = true;
                let newAdmin = new User(admin);
                await newAdmin.save();
                logger.info(`added ${JSON.stringify(admin)} to DB successfully`);
            }
        }
    }
    catch (error) {
        logger.error('DB Initialize fail. Please check DB connection. Reason: ' + error);
    } finally {
        if (isComplete) {
            logger.info('DB has initialized!');
        } else {
            throw new Error('Can not initialize admin account in mongoDB')
        }
    }
}

const initMongoDBConnection = async () => {
    // use createIndex() instead of ensureIndex() in mongodb
    mongoose.set('useCreateIndex', true);
    try {
        await mongoose.connect(config.database, { useNewUrlParser: true })
        logger.info(`Connected to ${config.database} successfully`);
        await DBinitialize();
    } catch (error) {
        logger.error(`Can not initilize DataBase : ${config.database}, reason: ${error}`);
        process.exit(1);
    }
}

// for testing purpose
const connectToMongoDB = async () => {
    try {
        mongoose.set('useCreateIndex', true);
        await mongoose.connect(config.database, { useNewUrlParser: true })
        logger.info(`Connected to ${config.database} successfully`);
    } catch (error) {
        logger.error(`Can not initilize DataBase : ${config.database}, reason: ${error}`);
        process.exit(1);
    }
}

export { initMongoDBConnection, connectToMongoDB }