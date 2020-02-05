import { expect } from 'chai';
import app from '../src/app';
import { agent as request } from 'supertest';
import mongoose = require('mongoose');
import { connectToMongoDB } from '../src/libs/utils/initMongoDBConnection';
import { step } from 'mocha-steps';
import { logger } from '../src/libs/utils/logger';
import modelViewSchemaRequest from './requestSchema/modelViewSchemaRequest'
import modelViewWeathermapRequest from './requestSchema/modelViewWeathermapRequest'

before(async () => {
    await connectToMongoDB();
})

describe('weathermap API BDD test',
    async () => {
        let models = ['CWB WRF 3KM'];
        // make requests for next step (schema API)
        let allSchemaRequest: modelViewSchemaRequest[] = [];
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

        // make requests for weathermap API
        let allWeathermapRequest: modelViewWeathermapRequest[] = [];
        step('2. should POST /api/modelView/schema for all input {model} and each {area}',
            async () => {
                logger.info(`allSchemaRequest: ${JSON.stringify(allSchemaRequest)}`)
                for (let idx = 0; idx < allSchemaRequest.length; idx++) {
                    let res = await request(app)
                        .post('/api/modelView/schema').send(allSchemaRequest[idx]);
                    expect(res.status).to.equal(200);

                    let allStartDate: string[] = res.body.startDate;
                    //ensure at least one date can be selected
                    expect(allStartDate).to.not.be.empty;
                    expect(allStartDate).to.be.an('array');

                    let allDataTypes = res.body.dataTypes;
                    // match front-end model view bottom navbar
                    expect(Object.keys(allDataTypes)).to.have.lengthOf(3);
                    Object.keys(allDataTypes).forEach(eachDataType => {
                        let detailTypes: string[] = allDataTypes[eachDataType]
                        expect(detailTypes).to.not.be.empty; // ensure at least one detail type in each dataType(bottom navbar buttom)
                        expect(detailTypes).to.be.an('array');
                        detailTypes.forEach(detailType => {
                            allStartDate.forEach(startDate => {
                                let weathermapRequest = new modelViewWeathermapRequest();
                                weathermapRequest.model = allSchemaRequest[idx].model
                                weathermapRequest.area = allSchemaRequest[idx].area
                                weathermapRequest.detailType = detailType;
                                weathermapRequest.startDateString = startDate;
                                allWeathermapRequest.push(weathermapRequest);
                            })
                        })
                    })
                }
                logger.info(`allWeathermapRequest length: ${allWeathermapRequest.length} `)
            });

        step('3. should POST /api/modelView/weathermap', async () => {
            for (let idx = 0; idx < allWeathermapRequest.length; idx++) {
                let res = await request(app)
                    .post('/api/modelView/weathermap').send(allWeathermapRequest[idx]);
                expect(res.status).to.equal(200);
                expect(res.body.availableFcstHour).to.be.an('array');
            }
        });
    }
);

after(async () => {
    await mongoose.connection.close();
})
