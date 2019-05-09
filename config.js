const fs = require('fs');
const privateKey = fs.readFileSync("./key/atmo.private.key");
const publicKey = fs.readFileSync("./key/atmo.public.key");

module.exports = {
    'privateKey': privateKey,
    'publicKey': publicKey,
    'database': 'mongodb://localhost:27017/test',
    'saltRounds': 12,
    'keepLoggedInDay': "7 days"
};