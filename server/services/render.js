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
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// ========================================================
// GET
// ========================================================
exports.homeRoutes = (req, res) => {
  res.render("index", { name: req.user.name });
};

exports.login = (req, res) => {
  res.render("login");
};

exports.register = (req, res) => {
  res.render("register");
};

// ========================================================
// POST
// ========================================================
exports.post_login =
  ("/login",
  passport.authenticate("local", {
    successRedirect: "/welcome",
    failureRedirect: "/login",
    failureFlash: true,
  }));


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
        res.redirect("/login");
      } catch (error) {
        console.log(error);
        res.redirect("/register");
      }
    }
  });

exports.post_delete = (req, res) => {
  req.logOut();
  res.redirect("/login");
};

// ========================================================

// ========================================================

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
