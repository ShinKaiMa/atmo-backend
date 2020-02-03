import { expect } from 'chai';
import app from '../src/app';
import { agent as request } from 'supertest';
import mongoose = require('mongoose');
import { connectToMongoDB } from '../src/libs/utils/initMongoDBConnection';
import {step} from 'mocha-steps';
import { logger } from '../src/libs/utils/logger';

before(()=>{
    connectToMongoDB();
})

describe('Weathermap API testing', async () => {
    let areas = null;
    step('should POST /api/modelView/area, and content length is not 0.', async () => {
        let res = await request(app)
            .post('/api/modelView/area').send({ model: "CWB WRF 3KM" });
        expect(res.status).to.equal(200);
        expect(res.body).to.not.be.empty;
        areas = res.body;
    });

    step('should POST /api/modelView/schema, and dataTypes keys should equals to 3 (match bottom navbar), startDate must not be empty.', async () => {
        logger.info(`areas ${areas}`)
        if(!areas){
            throw new Error('empty areas');
        }
        for (let idx = 0; idx < areas.length-1; idx++) {
            logger.info(`index ${idx}`)
            let res = await request(app)
                .post('/api/modelView/schema').send({ model: "CWB WRF 3KM", area: areas[idx] });
            expect(res.status).to.equal(200);
            expect(Object.keys(res.body.dataTypes)).to.have.lengthOf(3);
            expect(res.body.startDate).to.not.be.empty;
        }
    });

    step('should POST /api/modelView/weathermap', async () => {
        let res = await request(app)
            .post('/api/modelView/weathermap').send({ model: "CWB WRF 3KM", area: "TW", detailType: "Surface Wind and Precip", startDateString: "2020-01-28T18:00:00.000Z" });
        expect(res.status).to.equal(200);
    });
}
);

after(async () => {
    await mongoose.connection.close();
})
