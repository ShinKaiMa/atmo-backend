const fs = require('fs');
const express = require('express');
var bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const config = require("./config");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
var app = express();

var User = require('./models/user');

mongoose.set('useCreateIndex', true);// use createIndex() instead of ensureIndex() in mongodb
mongoose.connect(config.database); // connect to database


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
    console.log(req.body);
    var email = req.body.email;
    var password = req.body.password;
    console.log("email: " + email);
    console.log("password: " + password);

    User.findOne({ email }, function (err, user) {
        if (err) return console.error(err);

        if(!user){
            res.json({Error : "Authentication failed."})
        }else{
            console.log(" result "+user.isValidPassword(password))
            if(user.isValidPassword(password)){
                res.json({Success : "Success"})
            }
        }
        // res.json({ result: Users[0].isValidPassword(password) })
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