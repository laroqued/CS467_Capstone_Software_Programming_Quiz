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
// CONTACT/EMAIL
// ==============================================================

exports.get_contact =
  (checkAuthenticated,
  (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.render("contact", { name: req.user.name, msg: "" });
  });

exports.post_contact =
  ("/send",
  checkAuthenticated,
  async (req, res) => {
    const output = `
<p>You have a new contact request</p>
<ul>
<li>Name: Donnyves Laroque, Dominique Lazaros, Aaron Harris </li>
<li>Company: SoftWare Programming Quiz</li>
<li>Email: softwareprogrammingquiz@gmail.com</li>
<li>Quiz: http://localhost:3001/candidate_complete</li>
<li>Quiz: https://software-programming-quiz.herokuapp.com/candidate_complete</li>
<li>Phone: 555-555-5555</li>
<h3>Message </h3>
<p>Hello ${req.body.name}, </p>
<p></p>
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
      to: req.body.email, // list of receivers
      subject: req.body.subject, // Subject line
      text: "Hello world?", // plain text body
      html: output, // html body
    });
    transporter.verify(function (error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log("Mail server is running...");
        res.render("contact", {
          name: req.user.name,
          msg: "Email Successful!!!",
        });
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      }
    });
  });
// ==============================================================

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



// ========================================================

// ========================================================

// Aaron
exports.quizzes =
  (checkAuthenticated,
  async (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    const quizzes = await Quiz.find({ owner: req.user.email });
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
    let id = req.query.id;
    const questions = await Question.find({ quiz: id });
    res.render("quiz", { name: req.user.name, questions: questions, id: id});
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
exports.del_quiz =
  (checkAuthenticated,
  async (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");

    let id = req.query.id;
    const quiz = await Quiz.findById(id);
    res.render("delete_quiz", { id: id, name: req.user.name, quiz: quiz });
  });

// Aaron
exports.delete_quiz =
  ("/delete_question",
  checkAuthenticated,
  async (req, res) => {
    try {
      Quiz.findByIdAndDelete(req.body.id).then(() => {
        res.redirect("quizzes");
      });
    } catch (error) {
      console.log(error);
      res.redirect("create_quiz");
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

    let quizId = req.query.id;
    res.render("create_question", { quizId: quizId, name: req.user.name});
  });

// Aaron
exports.post_create_question =
  ("/create_question",
  checkAuthenticated,
  async (req, res) => {
    try {
      const question = new Question({
        prompt: req.body.prompt,
        quiz: req.body.quiz,
        answer: req.body.answer,
        choices: [req.body.choice2, req.body.choice3, req.body.choice4]
      });
      await question.save();
      await res.redirect("/quiz?id=" + req.body.quiz);
      res.status(201);
    } catch (error) {
      console.log(error);
      res.redirect("/create_quiz");
    }
  });

// Aaron
exports.question =
  (checkAuthenticated,
  async (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");

    let id = req.query.id;
    const question = await Question.findById(id);
    res.render("question", { id: id, name: req.user.name, question: question});
  });

// Aaron
exports.update_question =
  ("/question",
  checkAuthenticated,
  async (req, res) => {
    try {
      Question.findByIdAndUpdate(req.body.id, 
        {
          prompt: req.body.prompt, 
          answer: req.body.answer, 
          choices: [req.body.choice2, req.body.choice3, req.body.choice4]
        }
      ).then(() => {
        res.redirect("/quiz?id=" + req.body.quiz);
      });
    } catch (error) {
      console.log(error);
      res.redirect("/create_quiz");
    }
  });

// Aaron
exports.del_question =
  (checkAuthenticated,
  async (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");

    let id = req.query.id;
    const question = await Question.findById(id);
    res.render("delete_question", { id: id, name: req.user.name, question: question});
  });

// Aaron
exports.delete_question =
  ("/delete_question",
  checkAuthenticated,
  async (req, res) => {
    try {
      Question.findByIdAndDelete(req.body.id).then(() => {
        res.redirect("quiz?id=" + req.body.quiz);
      });
    } catch (error) {
      console.log(error);
      res.redirect("create_quiz");
    }
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

  

exports.add_survey = (req, res) =>{
    res.render('add_survey');
}


  exports.update_user = 
  (checkAuthenticated,
    (req, res) => {
      res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  
      res.render("update_user", { user : userdata.data})
    });