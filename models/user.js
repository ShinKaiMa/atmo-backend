var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

var userSchema = new Schema({
    email: { type: [String], index: true },
    password: { type: [String], index: true },
    auth: { type: [Boolean], index: true },
    admin: { type: [Boolean], index: true }
});




userSchema.methods.isValidPassword = async function isValidPassword(password, res) {
    var result = await bcrypt.compare(password, '' + this.password);
    console.log('in fn result: ' + result)
    if (result) {
        res.json({ Success: "Success" });
    } else {
        res.json({ Error: "Failed" });
    }
    return result;
}

userSchema.statics._getUserByEmail = function (email) {
    return new Promise((resolve, reject) => {
        this.findOne({ email }, function (err, user) {
            if (err) {
                reject('Exception encountered when connect to Mongodb')
            } else {
                resolve(user);
            };
        })
    })
}

var User = mongoose.model('User', userSchema);

User.prototype.isValid = async function () {
    try {
        var user = await User._getUserByEmail(this.email);
        console.log('async fun: ' + user)
        if (!user) {
            return false;
        }else{

        }

        return false;
    }
    catch (err) {
        console.log('err: ' + err)
    }
}

module.exports = User;