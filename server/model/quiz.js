const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
    name: {
        type: String,
        min: 6,
        max: 255
    },
    owner: {
        type: String,
    }
});

module.exports = mongoose.model("Quiz", quizSchema);