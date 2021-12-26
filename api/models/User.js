const {Schema, model} = require('mongoose')

const User = new Schema({
    login: {type: String, unique: true, required: true},
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    firstname: {type: String},
    lastname: {type: String}
})

module.exports = model('User', User)