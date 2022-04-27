exports.homeRoutes = (req, res) => {
  res.render("index");
};

exports.login = (req, res) => {
  res.render("login");
};

exports.register = (req, res) => {
  res.render("register");
};

exports.welcome = (req, res) => {
  res.render("welcome");
};

exports.create_quiz = (req, res) => {
  res.render("create_quiz");
};

exports.quiz_results = (req, res) => {
  res.render("quiz_results");
};

exports.canidate_quiz = (req, res) => {
  res.render("canidate_quiz");
};

exports.canidate_survey = (req, res) => {
  res.render("canidate_survey");
};

exports.canidate_complete = (req, res) => {
  res.render("canidate_complete");
};