const express = require("express");
const route = express.Router();
const services = require("../services/render");

const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../middlewares/auth");
const controller = require("../controller/controller");

// Routes
// Donnyves
route.get("/", checkAuthenticated, services.homeRoutes);

route.get("/login", checkNotAuthenticated, services.login);
route.post("/login", checkNotAuthenticated, services.post_login);

route.get("/register", checkNotAuthenticated, services.register);
route.post("/register", checkNotAuthenticated, services.post_register);

route.get("/contact", checkAuthenticated, services.get_contact);
route.post("/send", checkAuthenticated, services.post_contact);

route.get("/take_quiz", checkAuthenticated, services.get_take_quiz);
// route.post("/take_quiz", checkAuthenticated, services.post_submit_quiz);

route.delete("/logout"), checkNotAuthenticated, services.post_delete;
// ============================================================================================

route.get("/snuck_in", services.snuck_in);

route.get("/snuck_in", services.snuck_in)

// ============================================================================================
// ============================================================================================
// GOOGLE AUTH ROUTE
// ============================================================================================
route.get('/g', services.get_g) // NEW
route.get('/home', services.get_home) // NEW
route.get("/layouts/signup", services.local_sign_up); // NEW
route.get("/layouts/signin", services.get_signin); // NEW
route.get("/profile", services.get_profile); // NEW
route.get("/auth/google", services.google_auth); // NEW
//route.get("/auth/google/callback", services.google_auth_callback); // NEW (BUG HERE!!!)
route.get('/auth/logout', services.get_auth_logout)

route.post("/auth/layouts/signup", services.post_auth_signup);
route.post("/auth/layouts/signin", services.post_signin);
// ============================================================================================
// GOOGLE AUTH ROUTE END
// ============================================================================================



// Aaron
route.get("/quizzes", checkAuthenticated, services.quizzes);
route.get("/quiz", checkAuthenticated, services.quiz);

route.get("/create_quiz", checkAuthenticated, services.create_quiz);
route.post("/create_quiz", checkAuthenticated, services.post_create_quiz);

route.get("/delete_quiz", checkAuthenticated, services.del_quiz);
route.post("/delete_quiz", checkAuthenticated, services.delete_quiz);

route.get("/quiz_results", checkAuthenticated, services.quiz_results);

route.get("/create_question", checkAuthenticated, services.create_question);
route.post(
  "/create_question",
  checkAuthenticated,
  services.post_create_question
);

route.get("/question", checkAuthenticated, services.question);
route.post("/question", checkAuthenticated, services.update_question);

route.get("/delete_question", checkAuthenticated, services.del_question);
route.post("/delete_question", checkAuthenticated, services.delete_question);

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
/**
 *  @description Root Route
 *  @method GET /
 */
route.get("/", services.homeRoutes);

/**
 *  @description add users
 *  @method GET /add-user
 */
route.get("/add-survey", services.add_survey);

/**
 *  @description for update user
 *  @method GET /update-user
 */
route.get("/update-user", services.update_user);

// API
route.post("/api/users", controller.create);
route.get("/api/users", controller.find);
route.put("/api/users/:id", controller.update);
route.delete("/api/users/:id", controller.delete);

module.exports = route;
