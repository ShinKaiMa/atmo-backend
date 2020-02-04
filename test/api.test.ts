import { expect } from 'chai';
import app from '../src/app';
import { agent as request } from 'supertest';
import mongoose = require('mongoose');
import { connectToMongoDB } from '../src/libs/utils/initMongoDBConnection';
import { step } from 'mocha-steps';
import { logger } from '../src/libs/utils/logger';
import modelViewSchemaRequest from './requestSchema/modelViewAchemaRequest'

before(async () => {
    await connectToMongoDB();
})

describe('weathermap API BDD test',
    async () => {
        let models = ['CWB WRF 3KM'];
        let allSchemaRequest: modelViewSchemaRequest[] = []; // make requests for next step (schema API)
        step('1. should POST /api/modelView/area for all input {model}', async () => {
            for (let idx = 0; idx < models.length; idx++) {
                let areasResponse = await request(app)
                    .post('/api/modelView/area').send({ model: models[idx] });
                expect(areasResponse.status).to.equal(200);
                expect(areasResponse.body).to.not.be.empty;
                expect(areasResponse.body).to.be.an('array');
                let areas: string[] = areasResponse.body;
                areas.forEach(area => {
                    let schemaRequest = new modelViewSchemaRequest();
                    schemaRequest.model = models[idx];
                    schemaRequest.area = area;
                    allSchemaRequest.push(schemaRequest);
                })
            }
        });

        //TODO: make request for weathermap API
        step('2. should POST /api/modelView/schema for all input {model} and each {area}',
            async () => {
                logger.info(`allSchemaRequest: ${JSON.stringify(allSchemaRequest)}`)
                for (let idx = 0; idx < allSchemaRequest.length; idx++) {
                    let res = await request(app)
                        .post('/api/modelView/schema').send({ ...allSchemaRequest[idx] });
                    expect(res.status).to.equal(200);
                    expect(res.body.startDate).to.not.be.empty;
                    expect(res.body.startDate).to.be.an('array');
                    let dataTypes = res.body.dataTypes;
                    expect(Object.keys(dataTypes)).to.have.lengthOf(3); // match front-end model view bottom navbar
                }

            });

        step('3. should POST /api/modelView/weathermap', async () => {
            let res = await request(app)
                .post('/api/modelView/weathermap').send({ model: "CWB WRF 3KM", area: "TW", detailType: "Surface Wind and Precip", startDateString: "2020-01-28T18:00:00.000Z" });
            expect(res.status).to.equal(200);
        });
    }
);

after(async () => {
    await mongoose.connection.close();
})
