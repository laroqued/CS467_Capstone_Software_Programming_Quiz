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

route.delete("/logout"), checkNotAuthenticated, services.post_delete;
// ============================================================================================

route.get("/welcome", services.welcome);
// Aaron
route.get("/quizzes", checkAuthenticated, services.quizzes);
route.get("/create_quiz", checkAuthenticated, services.create_quiz); 
route.post("/create_quiz", checkAuthenticated, services.post_create_quiz);
route.get("/quiz_results", checkAuthenticated, services.quiz_results);

route.get(
  "/create_question/:quizId",
  checkAuthenticated,
  services.create_question
);

//-----------------------------
//Dominique
route.get("/candidate_quiz", checkAuthenticated, services.canidate_quiz);
route.get("/candidate_survey", checkAuthenticated, services.canidate_survey);
route.get(
  "/candidate_complete",
  checkAuthenticated,
  services.canidate_complete
);
//-----------------------------


module.exports = route;
