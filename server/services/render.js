require("dotenv").config();
const express = require("express");

const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const nodemailer = require("nodemailer");
const User = require("../model/User");
const Quiz = require("../model/quiz");
const Question = require("../model/question");
const bcrypt = require("bcryptjs");
const app = express();
const methodOverride = require("method-override");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
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
    secret: process.env.TOKEN_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

const { mainMail } = require("../../utils/email");

const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../middlewares/auth");
app.use(methodOverride("_method"));

// ========================================================
// GET
// ========================================================
// Donnyves
exports.homeRoutes =
  (checkAuthenticated,
  (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.render("index", { name: req.user.name });
  });
// Donnyves
exports.login =
  (checkNotAuthenticated,
  (req, res) => {
    res.render("login", { login_form_greeting: "SIGN IN TO YOUR ACCOUNT" });
  });
// Donnyves
exports.register =
  (checkNotAuthenticated,
  (req, res) => {
    res.render("register", { register_form_greeting: "Register" });
  });
// ==============================================================
// CONTACT

exports.get_contact =
  (checkAuthenticated,
  (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.render("contact", { name: req.user.name });
  });
// ==============================================================
exports.welcome =
  (checkAuthenticated,
  (req, res) => {
    res.render("layouts/welcome", { name: req.user.name });
  });


exports.post_contact =
  ("/send",
  checkAuthenticated, 
  async (req, res) => {
    const output = `
<p>You have a new contact request</p>
<ul>
<li>Name: ${req.body.name}</li>
<li>Company: ${req.body.company}</li>
<li>Email: ${req.body.email}</li>
<li>Phone: ${req.body.phone}</li>
<h3>Message </h3>
<p>${req.body.message}</p>

</ul>
`;
    // create reusable transporter object using the default SMTP transport
    let transporter = await nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.PASSWORD,
      },
      // tls:{
      //     rejectUnauthorized:false
      // }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Donnyves Laroque" <softwareprogrammingquiz@gmail.com>', // sender address
      to: "donnyves@gmail.com, donnyves.laroque@outlook.com", // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: output, // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    // Rerender if there is an error
    res.render("contact", { msg: "Email has been sent", name: req.user.name });
  });
// ==============================================================
// ==============================================================

// ========================================================
// POST
// ========================================================
// Donnyves
exports.post_login = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true, // shows messages from passort.config
});

// Donnyves
exports.post_register =
  ("/register",
  checkNotAuthenticated,
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

// Donnyves
exports.post_delete =
  (checkAuthenticated,
  async (req, res, next) => {
    await req.logOut();
    if (!req.user)
      res.header(
        "Cache-Control",
        "private, no-cache, no-store, must-revalidate"
      );
    res.redirect("/login");
  });

// // Donnyves
// exports.welcome =
//   (checkAuthenticated,
//   (req, res) => {
//     res.render("layouts/welcome", { name: req.user.name });
//   });
// ========================================================
exports.welcome =
  (checkAuthenticated,
  (req, res) => {
    res.render("layouts/welcome", { name: req.user.name });
  });
// ========================================================

// Aaron
exports.quizzes =
  (checkAuthenticated,
  async (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");

    const quizzes = await Quiz.find({ owner: req.user.email });
    //console.log(quizzes);

    res.render("quizzes", {
      name: req.user.name,
      email: req.user.email,
      quizzes: quizzes,
    });
  });
// Aaron
exports.quiz =
  (checkAuthenticated,
  async (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    let id = req.params.id;
    const questions = await Question.find({ quiz: id });
    res.render("quiz", { name: req.user.name, questions: questions });
  });
// Aaron
exports.create_quiz =
  (checkAuthenticated,
  (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.render("create_quiz", { name: req.user.name, email: req.user.email });
  });
// Aaron
exports.post_create_quiz =
  ("/create_quiz",
  checkAuthenticated,
  async (req, res) => {
    try {
      const quiz = new Quiz({
        name: req.body.name,
        owner: req.body.owner,
      });
      await quiz.save();
      await res.redirect("/quizzes");
      res.status(201);
    } catch (error) {
      console.log(error);
      res.redirect("/create_quiz");
    }
  });

// Aaron
exports.quiz_results =
  (checkAuthenticated,
  (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.render("quiz_results", { name: req.user.name });
  });
// Aaron
exports.create_question =
  (checkAuthenticated,
  (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");

    let quizId = req.params.quizId;
    res.render("create_question", { quizId: quizId, name: req.user.name });
  });

//Dominique
exports.canidate_quiz =
  (checkAuthenticated,
  (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");

    res.render("candidate_quiz", { name: req.user.name });
  });
//Dominique
exports.canidate_survey =
  (checkAuthenticated,
  (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");

    res.render("candidate_survey", { name: req.user.name });
  });
//Dominique
exports.canidate_complete =
  (checkAuthenticated,
  (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");

    res.render("candidate_complete", { name: req.user.name });
  });
