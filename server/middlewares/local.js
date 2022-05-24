const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const CandidateService = require("../controller/candidate.service");
const bcrypt = require("bcrypt");

passport.use(
  new LocalStrategy(async function (email, password, done) {
    const currentCandidate = await CandidateService.getCandidateByEmail({
      email,
    });

    if (!currentCandidate) {
      return done(null, false, {
        message: `Candidate with email ${email} does not exist`,
      });
    }

    if (currentCandidate.source != "local") {
      return done(null, false, {
        message: `You have previously signed up with a different signin method`,
      });
    }

    if (!bcrypt.compareSync(password, currentCandidate.password)) {
      return done(null, false, { message: `Incorrect password provided` });
    }
    return done(null, currentCandidate);
  })
);
