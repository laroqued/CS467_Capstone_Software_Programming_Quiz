const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name : {
        type : String,

    },
    email : {
        type: String,
        required: true,
        unique: true
    },
    gender : String,
    age : String,
    question1: String,
    question2: String
})

const Userdb = mongoose.model('userdb', schema);

module.exports = Userdb;