var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const config = require("../config");

var userSchema = new Schema({
    email: { type: [String], index: true },
    password: { type: [String], index: true },
    auth: { type: [Boolean], index: true },
    admin: { type: [Boolean], index: true }
});




userSchema.methods.isValidPassword = async function isValidPassword(password, res) {
    var result = await bcrypt.compare(password, '' + this.password);
    console.log('in fn result: ' + result);
    if (result) {
        res.json({ Success: "Success" });
    } else {
        res.json({ Error: "Failed" });
    }
    return result;
}

userSchema.methods._comparePassword = function (inputPassword) {
    return new Promise((resolve, reject) => {
        bcrypt.compare('' + inputPassword, '' + this.password, function (err, isValidPassword) {
            if (err) reject(err);
            resolve(isValidPassword)
        });
    })
}

userSchema.methods._signJWT = function () {
    return new Promise((resolve, reject) => {


    })
}

userSchema.statics._getUserByEmail = function (email) {
    return new Promise((resolve, reject) => {
        this.findOne({ email }, function (err, user) {
            if (err) {
                reject('Exception encountered when connect to Mongodb: ' + err);
            } else {
                resolve(user);
            };
        })
    })
}

userSchema.statics._signJWT = function (user) {
    return new Promise((resolve, reject) => {
            jwt.sign({user}, config.privateKey, { expiresIn: '30s',algorithm: 'RS256' }, function (err, token) {
            if (err) reject('Exception encountered when sign jwt: ' + err);
            resolve(token);
        });
    })
}

var User = mongoose.model('User', userSchema);

User.prototype.verifyUser = async function () {
    try {
        var inputPassword = this.password;
        var user = await User._getUserByEmail(this.email);
        if (!user) {
            return {
                Message: "invalid",
            }
        } else {
            var isValid = await user._comparePassword(inputPassword);
            if (!isValid) {
                return {
                    Message: "invalid",
                }
            }
            else if (isValid && user.auth) {
                var token = await User._signJWT(user);
                return {
                    Message: "login success",
                    Token: token
                }
            }
            else if (isValid && !user.auth) {
                delete user['password'];
                var token = await User._signJWT(user);
                return {
                    Message: "account has not been authorized",
                    Token: token
                }
            }
        }
    }
    catch (err) {
        console.log('err: ' + err)
        throw err;
    }
}

module.exports = User;