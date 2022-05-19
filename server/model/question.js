const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    prompt: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    choices: {
        type: [String]
    },
    answer: {
        type: String
    },
    answer_multiple: {
        type: [String]
    },
    quiz: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Question", questionSchema);