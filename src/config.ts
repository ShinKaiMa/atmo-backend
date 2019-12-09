import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();

const privateKey = fs.readFileSync("./key/atmo.key");
const publicKey = fs.readFileSync("./key/atmo.key.pub");
const adminList = JSON.parse(fs.readFileSync("./key/admin.json").toString());

let corsOrigin: string = "";
corsOrigin = process.env.NODE_ENV === 'develop' ? 'http://localhost:3000' : 'https://atmo.io'
let port = process.env.PORT;

let config = {
    'privateKey': privateKey,
    'publicKey': publicKey,
    'adminList': adminList,
    'database': 'mongodb://localhost:27017/test',
    'saltRounds': 12,
    'keepLoggedInDay': "7 days",
    corsOrigin,
    port,
    baseURL:`localhost:${port}`,
    weathermapRoute: "/weathermap"
};

export { config }