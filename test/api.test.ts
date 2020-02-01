import { expect } from 'chai';
import { app, server } from '../src/server';
import { agent as request } from 'supertest';
import mongoose = require('mongoose');
import { setTimeout } from 'timers';

const sleep = (millsecond) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, millsecond)
    })
}

describe('Weathermap API testing', async () => {
    it('should POST /api/modelView/area', async () => {
        const res = await request(app)
            .post('/api/modelView/area').send({ model: "CWB WRF 3KM" });
        expect(res.status).to.equal(200);
    });

    it('should POST /api/modelView/schema', async () => {
        const res = await request(app)
            .post('/api/modelView/schema').send({ model: "CWB WRF 3KM", area:"TW" });
        expect(res.status).to.equal(200);
    });

    it('should POST /api/modelView/weathermap', async () => {
        const res = await request(app)
            .post('/api/modelView/weathermap').send({ model: "CWB WRF 3KM", area: "TW", detailType: "Surface Wind and Precip", startDateString: "2020-01-28T18:00:00.000Z" });
        expect(res.status).to.equal(200);
    });
}
);

after((done) => {
    server.close(async () => {
        await sleep(5000);
        await mongoose.connection.close();
        done()
    })
})