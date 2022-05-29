const express = require("express");
const route = express.Router();
const services = require("../services/render");

const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../middlewares/auth");
const controller = require('../controller/controller');

// Routes
// Donnyves
route.get("/",checkAuthenticated, services.homeRoutes);

route.get("/login",checkNotAuthenticated, services.login);
route.post("/login",checkNotAuthenticated, services.post_login);

route.get("/register",checkNotAuthenticated, services.register);
route.post("/register",checkNotAuthenticated, services.post_register);

route.get("/contact", checkAuthenticated, services.get_contact);
route.post("/send", checkAuthenticated, services.post_contact);

route.get("/take_quiz", services.get_take_quiz);
route.post("/take_quiz", services.post_submit_quiz);

route.delete("/logout"), checkNotAuthenticated, services.post_delete;
// ============================================================================================
route.get("/snuck_in", services.snuck_in)
// Aaron
route.get("/start_quiz", services.start_quiz);

route.get("/quizzes", checkAuthenticated, services.quizzes);
route.get("/quiz", checkAuthenticated, services.quiz);

route.get("/create_quiz", checkAuthenticated, services.create_quiz);
route.post("/create_quiz", checkAuthenticated, services.post_create_quiz);

route.get("/delete_quiz", checkAuthenticated, services.del_quiz);
route.post("/delete_quiz", checkAuthenticated, services.delete_quiz);

route.get("/quiz_results", checkAuthenticated, services.quiz_results);

route.get("/create_question", checkAuthenticated, services.create_question);
route.post("/create_question", checkAuthenticated, services.post_create_question);

route.get("/question", checkAuthenticated, services.question);
route.post("/question", checkAuthenticated, services.update_question);

route.get("/delete_question", checkAuthenticated, services.del_question);
route.post("/delete_question", checkAuthenticated, services.delete_question);

route.post("/create_quiz_instance", checkAuthenticated, services.create_quiz_instance);

//-----------------------------
//Dominique
route.get("/candidate_quiz", checkAuthenticated, services.canidate_quiz);
route.get("/candidate_survey", services.canidate_survey);
route.get("/candidate_complete", services.get_candidate_complete
);
//-----------------------------
/**
 *  @description Root Route
 *  @method GET /
 */
 route.get('/candidate_index', services.homeRoutes1);

 /**
  *  @description add users
  *  @method GET /add-user
  */
 route.get('/add-survey', services.add_survey)
 
 /**
  *  @description for update user
  *  @method GET /update-user
  */
 route.get('/update-user', services.update_user)
 
 
 // API
 route.post('/api/users', controller.create);
 route.get('/api/users', controller.find);
 route.put('/api/users/:id', controller.update);
 route.delete('/api/users/:id', controller.delete);

module.exports = route;
