const fs = require('fs');
var privateKey = fs.readFileSync("./key/atmo.private.key");
var publicKey = fs.readFileSync("./key/atmo.public.key");

module.exports = {
    'privateKey': privateKey,
    'publicKey': publicKey,
    'database': 'mongodb://localhost:27017/test',
    'saltRounds':12
};