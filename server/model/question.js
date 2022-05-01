const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    prompt: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    choices: {
        type: map
    },
    answer: {
        type: String
    },
    quiz: {
        type: String
    }
});

module.exports = mongoose.model("Question", userSchema);