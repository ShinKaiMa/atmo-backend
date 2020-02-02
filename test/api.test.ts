import { expect } from 'chai';
import { app, server } from '../src/server';
import { agent as request } from 'supertest';
import mongoose = require('mongoose');

describe('Weathermap API testing', async () => {
    it('should POST /api/modelView/area, and content length is not 0.', async () => {
        let res = await request(app)
            .post('/api/modelView/area').send({ model: "CWB WRF 3KM" });
        expect(res.status).to.equal(200);
        expect(res.body).to.not.be.empty;
    });

    it('should POST /api/modelView/schema, and dataTypes keys should equals to 3 (match bottom navbar), startDate must not be empty.', async () => {
        let areas: string[] = ["TW", "East Asia"]; // fake data
        for (let idx; idx < areas.length; idx++) {
            console.log(`idx: ${idx}`)
            let res = await request(app)
                .post('/api/modelView/schema').send({ model: "CWB WRF 3KM", area: areas[idx] });
            expect(res.status).to.equal(200);
            expect(Object.keys(res.body.dataTypes)).to.have.lengthOf(3);
            expect(res.body.startDate).to.not.be.empty;
        }
    });

    it('should POST /api/modelView/weathermap', async () => {
        let res = await request(app)
            .post('/api/modelView/weathermap').send({ model: "CWB WRF 3KM", area: "TW", detailType: "Surface Wind and Precip", startDateString: "2020-01-28T18:00:00.000Z" });
        expect(res.status).to.equal(200);
    });
}
);

after((done) => {
    server.close(async () => {
        await mongoose.connection.close();
        done()
    })
})