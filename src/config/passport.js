const passport = require("passport");
const User = require("../user/user.model");

passport.serializeUser((candidate, done) => {
  done(null, candidate.id);
});

passport.deserializeUser(async (_id, done) => {
  const currentUser = await User.findOne({ _id });
  done(null, currentUser);
});
