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


// ========================================================

// ============================================================================================
// ============================================================================================
// GOOGLE AUTH ROUTE

// const isLoggedIn = (req, res, next) => {
//   req.user ? next() : res.sendStatus(401);
// };

// exports.get_g =
//   ("/g",
//   (req, res) => {
//     res.render("google.ejs");
//   });
// exports.get_home =
//   ("/home",
//   (req, res) => {
//     res.render("home.ejs");
//   });
// exports.local_sign_up =
//   ("/layouts/signup",
//   (req, res) => {
//     res.render("layouts/signup.ejs");
//   });
// exports.get_signin =
//   ("/layouts/signin",
//   (req, res) => {
//     res.render("layouts/signin.ejs");
//   });
// exports.get_profile =
//   ("/profile",
//   isLoggedIn,
//   (req, res) => {
//     res.render("profile.ejs", { user: req.user });
//   });

// exports.google_auth =
//   ("/auth/google",
//   passport.authenticate("google", {
//     scope: ["profile", "email"],
//   }));

// exports.google_auth_callback =
//   ("/auth/google/callback",
//   passport.authenticate("google", {
//     failureRedirect: "/g",
//     successRedirect: "/profile",
//     failureFlash: true,
//     successFlash: "Successfully logged in!",
//   }));

// exports.get_auth_logout =
//   ("/auth/logout",
//   (req, res) => {
//     req.flash("success", "Successfully logged out");
//     req.session.destroy(function () {
//       res.clearCookie("connect.sid");
//       res.redirect("/home");
//     });
//   });

// exports.post_auth_signup =
//   ("/auth/layouts/signup",
//   async (req, res) => {
//     const { first_name, last_name, email, password } = req.body;

//     if (password.length < 8) {
//       req.flash(
//         "error",
//         "Account not created. Password must be 7+ characters long"
//       );
//       return res.redirect("/layouts/signup");
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     try {
//       await UserService.addLocalUser({
//         id: uuid.v4(),
//         email,
//         firstName: first_name,
//         lastName: last_name,
//         password: hashedPassword,
//       });
//     } catch (e) {
//       req.flash(
//         "error",
//         "Error creating a new account. Try a different login method."
//       );
//       res.redirect("/layouts/signup");
//     }

//     res.redirect("/layouts/signin");
//   });
// exports.post_signin =
//   ("/auth/layouts/signin",
//   passport.authenticate("local", {
//     successRedirect: "/profile",
//     failureRedirect: "/layouts/signin",
//     failureFlash: true,
//   }));
// ============================================================================================
// GOOGLE AUTH ROUTE END
// ============================================================================================

// TESTING
exports.snuck_in =
  (checkAuthenticated,
  (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.render("snuck_in");
  });
// ========================================================
// Donnyves
exports.homeRoutes =
  (checkAuthenticated,
  (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.render("index", { login_name: req.user.login_name });
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

exports.get_take_quiz =
  (checkNotAuthenticated,
  (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.render("take_quiz", {
      name: req.user.name,
      login_name: req.user.login_name,
    });
  });
// ==============================================================
// CONTACT/EMAIL
// ==============================================================
exports.get_contact =
  (checkAuthenticated,
  async (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    let quizId = req.query.id;
    const name = await Quiz.find({
      name: req.user.name,
    });
    res.render("contact", {
      login_name: req.user.login_name,
      msg: "",
      quizId: quizId,
      name: name,
    });
  });

exports.post_contact =
  ("/send",
  checkAuthenticated,
  async (req, res) => {
    let quizId = req.query.id;

    const output = `
<p>You have a new contact request</p>
<ul>
<li>Name: Donnyves Laroque, Dominique Lazaros, Aaron Harris </li>
<li>Company: SoftWare Programming Quiz</li>
<li>Email: softwareprogrammingquiz@gmail.com</li>
<li>Phone: 555-555-5555</li>
<h3>Message </h3>
<p>Hello ${req.body.email_name}, </p>
<p></p>
<p>${req.body.message}</p>
<p>Click the link below to start your quiz.</p>
<p></p>
<li>Local Host Quiz: http://localhost:3001/snuck_in</li>
<li>Local Host Quiz: http://${process.env.HOST}:${process.env.PORT}/candidate_quiz?id=${req.body.quiz}</li>
<li>Local Host Quiz: http://${process.env.HOST}:${process.env.PORT}/take_quiz?id=${req.body.quiz}</li>
<li>Production Quiz: https://software-programming-quiz.herokuapp.com/candidate_quiz?id=${req.body.quiz}</li>
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
          login_name: req.user.login_name,
          msg: "Email Successful!!!",
          quizId: quizId,
        });
        console.log(`Message sent: ${info.messageId}`);
        console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    });
  });

// ==============================================================
// EMAIL END
// ==============================================================

// ==============================================================

// ========================================================
// POST
// ========================================================
// Donnyves
exports.post_login = passport.authenticate("local", {
  successRedirect: "/index",
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
          login_name: req.body.login_name,
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
      login_name: req.user.login_name,
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
    res.render("quiz", {
      login_name: req.user.login_name,
      questions: questions,
      id: id,
    });
  });

// Aaron
exports.create_quiz =
  (checkAuthenticated,
  (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.render("create_quiz", {
      name: req.user.name,
      email: req.user.email,
      login_name: req.user.login_name,
    });
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
        login_name: req.user.login_name,
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
    res.render("delete_quiz", {
      id: id,
      login_name: req.user.login_name,
      quiz: quiz,
    });
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
    res.render("quiz_results", { login_name: req.user.login_name });
  });

// Aaron
exports.create_question =
  (checkAuthenticated,
  (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");

    let quizId = req.query.id;

    let type = null;
    if (!req.query.type) {
      type = "multiple_choice";
    } else {
      type = req.query.type;
    }

    res.render("create_question", {
      quizId: quizId,
      login_name: req.user.login_name,
      type: type,
    });
  });

// Aaron
exports.post_create_question =
  ("/create_question",
  checkAuthenticated,
  async (req, res) => {
    console.log(req.body);
    try {
      let answer = null;
      let answers = null;
      let choices = null;

      if (req.body.type == "multiple_choice") {
        answer = req.body.answer;
        choices = [req.body.choice2, req.body.choice3, req.body.choice4];
      } else if (req.body.type == "true_or_false") {
        answer = req.body.answer;
      } else if (req.body.type == "check_all") {
        answers = [];
        choices = [];
        if (req.body.answer1) answers.push(req.body.answer1);
        if (req.body.answer2) answers.push(req.body.answer2);
        if (req.body.answer3) answers.push(req.body.answer3);
        if (req.body.answer4) answers.push(req.body.answer4);
        if (req.body.option1) choices.push(req.body.option1);
        if (req.body.option2) choices.push(req.body.option2);
        if (req.body.option3) choices.push(req.body.option3);
        if (req.body.option4) choices.push(req.body.option4);
      } else if (req.body.type == "fill") {
        answers = req.body.answer.split(",");
      }

      const question = new Question({
        type: req.body.type,
        prompt: req.body.prompt,
        quiz: req.body.quiz,
        answer: answer,
        answer_multiple: answers,
        choices: choices,
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
    res.render("question", {
      id: id,
      login_name: req.user.login_name,
      question: question,
    });
  });

// Aaron
exports.update_question =
  ("/question",
  checkAuthenticated,
  async (req, res) => {
    try {
      let answer = null;
      let answers = null;
      let choices = null;

      if (req.body.type == "multiple_choice") {
        answer = req.body.answer;
        choices = [req.body.choice2, req.body.choice3, req.body.choice4];
      } else if (req.body.type == "true_or_false") {
        answer = req.body.answer;
      } else if (req.body.type == "check_all") {
        answers = [];
        choices = [];
        if (req.body.answer1) answers.push(req.body.answer1);
        if (req.body.answer2) answers.push(req.body.answer2);
        if (req.body.answer3) answers.push(req.body.answer3);
        if (req.body.answer4) answers.push(req.body.answer4);
        if (req.body.option1) choices.push(req.body.option1);
        if (req.body.option2) choices.push(req.body.option2);
        if (req.body.option3) choices.push(req.body.option3);
        if (req.body.option4) choices.push(req.body.option4);
      } else if (req.body.type == "fill") {
        answers = req.body.answer.split(",");
      }

      Question.findByIdAndUpdate(req.body.id, {
        prompt: req.body.prompt,
        answer: answer,
        answer_multiple: answers,
        choices: choices,
      }).then(() => {
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
    res.render("delete_question", {
      id: id,
      login_name: req.user.login_name,
      question: question,
    });
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
  async (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    let id = req.query.id;

    const quiz = await Quiz.findById(id);

    const questions = await Question.find({ quiz: id });

    res.render("candidate_quiz", {
      id: id,
      login_name: req.user.login_name,
      questions: questions,
      owner: req.user.email,
      quiz: quiz,
    });
  });
//Dominique
exports.canidate_survey =
  (checkAuthenticated,
  (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");

    res.render("candidate_survey", {
      name: req.user.name,
      login_name: req.user.login_name,
    });
  });
//Dominique
exports.canidate_complete =
  (checkAuthenticated,
  (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");

    res.render("candidate_complete", {
      login_name: req.user.login_name,
      name: req.user.name,
    });
  });

exports.add_survey = (req, res) => {
  res.render("add_survey");
};

exports.update_user =
  (checkAuthenticated,
  (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");

    res.render("update_user", { user: userdata.data });
  });
