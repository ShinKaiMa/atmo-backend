const express = require('express');
var bodyParser = require('body-parser')
const config = require("./config");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
var app = express();

var User = require('./models/user');

mongoose.set('useCreateIndex', true);// use createIndex() instead of ensureIndex() in mongodb
mongoose.connect(config.database, { useNewUrlParser: true }); // connect to database


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

// use /setup to create a sample admin user for testing auth apis
app.get('/setup', function (req, res) {

    bcrypt.hash("password", config.saltRounds).then(function (hash) {
        // create a sample user
        var admin = new User({
            email: 'atmo.io@gmail.com',
            password: hash,
            auth: true,
            admin: true
        });

        // save the sample user
        admin.save(function (err) {
            if (err) throw err;
        });
        console.log('User saved successfully');
        res.json({ success: true });
    });
});


app.post("/api/login", (req, res) => {
    console.log('get login req: ' + JSON.stringify(req.body));
    user = new User({
        email: req.body.email,
        password: req.body.password
    });
    user.verifyUser().then((result) => {
        res.json(result)
    });
})


app.listen(5000, () => {
    console.log('running at port 5000');
    // var token = jwt.sign({ foo: 'bar' }, config.privateKey, { algorithm: 'RS256' });
    // console.log(token);

    // jwt.verify(token, config.publicKey, { algorithms: ['RS256'] }, function (err, payload) {
    //     // if token alg != RS256,  err == invalid signature
    //     console.log('err: ' + err);
    //     console.log('payload: ' + JSON.stringify(payload));
    // });

})