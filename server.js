'use strict'
const path = require('path')
const express = require('express');
var bodyParser = require('body-parser');
const config = require("./config");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
var app = express();
var history = require('connect-history-api-fallback');
var DBinitialize = require("./libs/utils/DBInitialize");
var User = require('./models/user');

// use createIndex() instead of ensureIndex() in mongodb
mongoose.set('useCreateIndex', true);
mongoose.connect(config.database, { useNewUrlParser: true })
    .then(() => {
        console.log(`Connected to ${config.database} successfully`);
        DBinitialize();
    })
    .catch((error) => {
        console.log(`Can not connect to ${config.database}, reason: ` + error);
        process.exit(1);
    });

app.use(history());
app.use(express.static(path.join(__dirname, 'dist')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/api/login", (req, res) => {
    console.log('get login req: ' + JSON.stringify(req.body));
    var user = new User({
        email: req.body.email,
        password: req.body.password
    });
    user.verify().then((result) => {
        res.json(result)
    }).catch((error)=>{
        res.status(500).json({Error : error});
    })
    ;
})

app.listen(5000, () => {
    console.log('running at port 5000');
})