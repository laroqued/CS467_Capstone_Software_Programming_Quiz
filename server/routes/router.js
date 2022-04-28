const express = require("express");
const route = express.Router();
const services = require("../services/render");

const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../middlewares/auth");

// Routes
// Donnyves
route.get("/",checkAuthenticated, services.homeRoutes);

route.get("/login",checkNotAuthenticated, services.login);
route.post("/login",checkNotAuthenticated, services.post_login);

route.get("/register",checkNotAuthenticated, services.register);
route.post("/register",checkNotAuthenticated, services.post_register);

route.post("/delete"), services.post_delete;
// ============================================================================================



route.get("/welcome", services.welcome);
// Aaron
route.get("/create_quiz", services.create_quiz); 
route.get("/quiz_results", services.quiz_results);
//-----------------------------
//Dominique
route.get("/canidate_quiz", services.canidate_quiz);
route.get("/canidate_survey", services.canidate_survey);
route.get("/canidate_complete", services.canidate_complete);
//-----------------------------


module.exports = route;
