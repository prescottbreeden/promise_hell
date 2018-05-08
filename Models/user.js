var mongoose = require('mongoose');
var validate = require('mongoose-validate');
// user schema
const UserSchema = new mongoose.Schema({
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    email: {type: String, required: true, lowercase: true, unique: true, validate: [validate.email, 'invalid email address']},
    passwordHash: {type: String, required: true}
}, {timestamps: true})




module.exports = mongoose.model('User', User);