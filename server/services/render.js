exports.homeRoutes = (req, res) => {
  res.render("index");
};

exports.sign_in = (req, res) => {
  res.render("sign_in");
};

exports.create_account = (req, res) => {
  res.render("create_account");
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