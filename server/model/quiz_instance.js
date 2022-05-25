const mongoose = require("mongoose");

const quiz_instanceSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    quiz: {
        type: String,
        required: true
    },
    employer: {
        type: String,
        required: true
    },
    grade: {
        type: Number
    },
    completed: {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model("quiz_instance", quiz_instanceSchema);