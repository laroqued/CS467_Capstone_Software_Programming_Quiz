require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const app = express();

const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../middlewares/auth");

const initializePassport = require("../../passport-config");
initializePassport(
  passport,
  async (email) => {
    const userFound = await User.findOne({ email });
    return userFound;
  },
  async (id) => {
    const userFound = await User.findOne({ _id: id });
    return userFound;
  }
);

app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
// ========================================================
// GET
// ========================================================
// Donnyves
exports.homeRoutes = (req, res) => {
  res.render("index", { name: req.user.name });
};
// Donnyves
exports.login = (req, res) => {
  res.render("login");
};

exports.register = (req, res) => {
  res.render("register");
};


// ========================================================
// POST
// ========================================================
// Donnyves
exports.post_login=(  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/welcome",
    failureRedirect: "/login",
    failureFlash: true,
  }))

  
  



// Donnyves
exports.post_register =
  ("/register",
  async (req, res) => {
    const userFound = await User.findOne({ email: req.body.email });

    if (userFound) {
      req.flash("error", "User with that email already exists");
      res.redirect("/register");
    } else {
      try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
          name: req.body.name,
          email: req.body.email,
          password: hashedPassword,
        });

        await user.save();
        await res.redirect("/login");
      } catch (error) {
        console.log(error);
        res.redirect("/register");
      }
    }
  });



// Donnyves
exports.post_delete = async(req, res) => {
  await req.logOut();
  res.redirect("/login");
};

// ========================================================


// ========================================================
// Donnyves
exports.welcome = (req, res) => {
  res.render("welcome");
};
// Aaron
exports.create_quiz = (req, res) => {
  res.render("create_quiz");
};
// Aaron
exports.quiz_results = (req, res) => {
  res.render("quiz_results");
};


//Dominique
exports.canidate_quiz = (req, res) => {
  res.render("canidate_quiz");
};
//Dominique
exports.canidate_survey = (req, res) => {
  res.render("canidate_survey");
};
//Dominique
exports.canidate_complete = (req, res) => {
  res.render("canidate_complete");
};
