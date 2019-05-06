var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

var userSchema = new Schema({
    email: { type: [String], index: true },
    password: { type: [String], index: true },
    auth: { type: [Boolean], index: true },
    admin: { type: [Boolean], index: true }
});

userSchema.methods.isValidPassword = function (password) {
    bcrypt.compare(password, '' + this.password, function (err, res) {
        if (err) throw err;
        console.log('res : ' + res)
        return res;
    });
}

var User = mongoose.model('User', userSchema);


module.exports = User;