const fs = require('fs');
const privateKey = fs.readFileSync("./key/atmo.key");
const publicKey = fs.readFileSync("./key/atmo.key.pub");
const adminList = JSON.parse(fs.readFileSync("./key/admin.json"));

let config = {
    'privateKey': privateKey,
    'publicKey': publicKey,
    'adminList': adminList,
    'database': 'mongodb://localhost:27017/test',
    'saltRounds': 12,
    'keepLoggedInDay': "7 days"
};

export {config}