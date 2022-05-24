let mongoose = require("mongoose");
let Schema = mongoose.Schema;

const candidateSchema = new Schema({
  id: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    required: [true, "email required"],
    unique: [true, "email already registered"],
  },
  firstName: String,
  lastName: String,
  profilePhoto: String,
  password: String,
  source: { type: String, required: [true, "source not specified"] },
  lastVisited: { type: Date, default: new Date() },
});

var candidateModel = mongoose.model("candidate", candidateSchema, "candidate");

module.exports = candidateModel;
