const passport = require("passport");
const Candidate = require("../model/candidate.model");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const currentCandidate = await Candidate.findOne({ id });
  done(null, currentCandidate);
});
