import app from './app'
import { config } from './config';
import { logger } from './libs/utils/logger';
import { initMongoDBConnection } from './libs/utils/initMongoDBConnection';
import * as dotenv from 'dotenv';
dotenv.config();

const startServer = async()=>{
    try{
        await initMongoDBConnection();
        app.listen(config.port, () => {
            logger.info(`running at port ${config.port}, base URL: ${config.baseURL}`);
            logger.info(`using  CORS-ORIGIN domain: [${config.corsOrigin}]`);
            logger.info(`using local static image path: [${process.env.LOCAL_STATIC_IMG_PATH}], route: [${config.baseURL + config.weathermapRoute}]`);
        })
    }catch(error){
        logger.error(error)
        process.exit(1);
    }
}

startServer();