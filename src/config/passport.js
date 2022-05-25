const passport = require("passport");
const Candidate = require("../user/user.model");

passport.serializeUser((candidate, done) => {
  done(null, candidate.id);
});

passport.deserializeUser(async (_id, done) => {
  const currentUser = await Candidate.findOne({ _id });
  done(null, currentUser);
});
