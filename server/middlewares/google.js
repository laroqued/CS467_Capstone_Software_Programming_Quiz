const passport = require("passport");
const CandidateService = require("../model/candidate.model");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      callbackURL: process.env.CALLBACK_URL,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    },
    async (accessToken, refreshToken, profile, done) => {
      const id = profile.id;
      const email = profile.emails[0].value;
      const firstName = profile.name.givenName;
      const lastName = profile.name.familyName;
      const profilePhoto = profile.photos[0].value;
      const source = "google";

      const currentCandidate = await CandidateService.getCandidateByEmail({
        email,
      });

      if (!currentCandidate) {
        const newCandidate = await CandidateService.addGoogleCandidate({
          id,
          email,
          firstName,
          lastName,
          profilePhoto,
        });
        return done(null, newCandidate);
      }

      if (currentCandidate.source != "google") {
        //return error
        return done(null, false, {
          message: `You have previously signed up with a different signin method`,
        });
      }

      currentCandidate.lastVisited = new Date();
      return done(null, currentCandidate);
    }
  )
);
