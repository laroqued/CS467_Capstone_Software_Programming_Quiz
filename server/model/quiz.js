const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    questions: {
        type: [ObjectId]
    }
});

module.exports = mongoose.model("Quiz", userSchema);