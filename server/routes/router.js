const express = require("express");
const route = express.Router();

const services = require("../services/render");

// Routes
route.get("/", services.homeRoutes);
route.get("/sign_in", services.sign_in);
route.get("/create_account", services.create_account)
route.get("/welcome", services.welcome);
route.get("/create_quiz", services.create_quiz);
route.get("/quiz_results", services.quiz_results);
route.get("/canidate_quiz", services.canidate_quiz);
route.get("/canidate_survey", services.canidate_survey);
route.get("/canidate_complete", services.canidate_complete);


module.exports = route;
