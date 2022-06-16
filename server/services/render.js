require("dotenv").config();
const express = require("express");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const nodemailer = require("nodemailer");
const User = require("../model/User");
const Quiz = require("../model/quiz");
const Question = require("../model/question");
const Quiz_Instance = require("../model/quiz_instance");
const bcrypt = require("bcryptjs");
// make an API request from the cloud API MondgoDB database
const axios = require("axios");
const app = express();
const methodOverride = require("method-override");
var nodeoutlook = require("nodejs-nodemailer-outlook");

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
const quiz_instance = require("../model/quiz_instance");
app.use(methodOverride("_method"));

// ========================================================
// GET
// ========================================================

// JSON Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// ========================================================
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
  async (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");

    let id = req.user.id;
    const users = await User.findById(id);

    res.render("index", {
      id: id,
      login_name: req.user.login_name,
      users: users,
    });
  });

// Donnyves
exports.login =
  (checkNotAuthenticated,
  async (req, res) => {
    let id = req.query.id;

    const quiz_instance = await Quiz_Instance.findById(id);

    res.render("login", {
      login_form_greeting: "SIGN IN TO YOUR ACCOUNT",
      id: id,
      quiz_instance: quiz_instance,
    });
  });

// Donnyves
exports.register =
  (checkNotAuthenticated,
  (req, res) => {
    res.render("register", { register_form_greeting: "Register" });
  });
// Aaron
exports.start_quiz = async (req, res) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  try {
    let id = req.query.id;

    const quiz_instance = await Quiz_Instance.findById(id);
    const quiz = await Quiz.findById(quiz_instance.quiz);

    res.render("start_quiz", {
      id: id,
      quiz_instance: quiz_instance,
      quiz: quiz,
    });
  } catch (error) {
    console.log(error);
    res.redirect("404");
  }
};
// Aaron
exports.get_take_quiz = async (req, res) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");

  try {
    let id = req.query.id;
    const quiz_instance = await Quiz_Instance.findById(id);
    const quiz = await Quiz.findById(quiz_instance.quiz);
    const questions = await Question.find({ quiz: quiz._id });
    const users = await User.findById(quiz_instance.employer);

    let complete = quiz_instance.completed;

    if (!complete) {
      await Quiz_Instance.findByIdAndUpdate(id, { completed: true });
    }

    res.render("take_quiz", {
      id: id,
      questions: questions,
      quiz: quiz,
      quiz_instance: quiz_instance,
      complete: complete,
      users: users,
    });
  } catch (error) {
    console.log(error);
    res.redirect("404");
  }
};
// Aaron
exports.post_submit_quiz = async (req, res) => {
  try {
    let total = Object.keys(req.body).length;
    let correct = 0;
    const keys = Object.keys(req.body);

    for (let i = 0; i < total; i++) {
      let key = keys[i];
      if (key != "id") {
        let answer = req.body[key];
        let question = await Question.findById(key);

        // grading

        // true/false
        if (question.type == "true_or_false") {
          if (typeof answer != "string") {
            if (answer[1] == String(question.answer)) {
              correct += 1;
            }
          }
          // multiple choice
        } else if (question.type == "multiple_choice") {
          if (typeof answer != "string") {
            if (answer[1] == String(question.answer)) {
              correct += 1;
            }
          }
          // check all that apply
        } else if (question.type == "check_all") {
          let correct_answer = true;
          question.answer_multiple.map(String);

          if (typeof answer == "string") {
            answer = [];
          }

          answer.forEach((current_answer) => {
            if (
              !question.answer_multiple.includes(current_answer) &
              (current_answer != "")
            ) {
              correct_answer = false;
              return;
            }
          });

          question.answer_multiple.forEach((current_answer) => {
            if (!answer.includes(current_answer)) {
              correct_answer = false;
              return;
            }
          });

          if (correct_answer) {
            correct += 1;
          }
          // fill in the blank
        } else if (question.type == "fill") {
          question.answer_multiple.map(String);
          let lower = question.answer_multiple.map((element) =>
            element.toLowerCase()
          );
          if (typeof answer != "string") {
            if (lower.includes(answer[1].toLowerCase())) {
              correct += 1;
            }
          }
        }
      }
    }

    let grade = correct / (total - 1);
    await Quiz_Instance.findByIdAndUpdate(req.body.id, {
      grade: grade,
      completed: true,
    });

    //=====================================
    // EMAIL FUNCTIONALITY HERE
    // send email to employer
    // // Donnyves
    //=====================================
    let quiz_instance = await Quiz_Instance.findById(req.body.id);
    let quiz = await Quiz.findById(quiz_instance.quiz);
    let users = await User.findById(quiz_instance.employer);

    const output = `
 
      <p>Hello  <strong>${users.login_name}</strong>, </p>
      <p><p/>
      <p>The "<strong>${quiz.name}</strong>" quiz has been completed by <strong>${quiz_instance.firstName}</strong><strong>
      ${quiz_instance.lastName}</strong>.<p/>
      <p><p/>
`;

    // create reusable transporter object using the default SMTP transport
    let transporter = await nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: `"${quiz_instance.firstName} ${quiz_instance.lastName}" 
        <${quiz_instance.email}>`, // sender address

      to: quiz.owner, // list of receivers
      subject: `"${quiz.name}" Quiz Instance (${quiz_instance._id}) - Submission Received`, // Subject line
      text: "Hello world?", // plain text body
      html: output, // html body
    });

    transporter.verify(function (error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log("Mail server is running...");
        console.log(`Message sent: ${info.messageId}`);
        console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    });

    //=====================================
    // EMAIL END
    await res.redirect(`/candidate_complete?id=${req.body.id}`);
    res.status(201);
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
};

// for manually creating quiz_instance with postman
exports.create_quiz_instance =
  ("/create_quiz_instance",
  checkAuthenticated,
  async (req, res) => {
    try {
      const quiz_instance = new Quiz_Instance({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        quiz: req.body.quiz,
        employer: req.body.employer,
        completed: false,
      });
      await quiz_instance.save();
      await res.redirect("/quizzes");
      res.status(201);
    } catch (error) {
      console.log(error);
      res.redirect("/create_quiz");
    }
  });

// ==============================================================
// CONTACT/EMAIL
// ==============================================================
// Donnyves
exports.get_contact =
  (checkAuthenticated,
  async (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    try {
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
    } catch (error) {
      console.log(error);
      res.redirect("404");
    }
  });
// Donnyves
exports.post_contact =
  ("/send",
  checkAuthenticated,
  async (req, res) => {
    // create quiz_instance
    const quiz_instance = new Quiz_Instance({
      firstName: req.body.first_name,
      lastName: req.body.last_name,
      email: req.body.email,
      quiz: req.body.quiz,
      employer: req.user._id,
      completed: false,
      grade: 0,
    });
    await quiz_instance.save();
    let id = quiz_instance._id;
    let quizId = req.query.id;

    const output = `
<p>You have a new contact request</p>
<ul>
<li>Name: Donnyves Laroque, Dominique Lazaros, Aaron Harris </li>
<li>Company: SoftWare Programming Quiz</li>
<li>Email: softprogramquiz@outlook.com</li>
<li>Phone: 555-555-5555</li>
<h3>Message </h3>
<p>Hello ${req.body.first_name} ${req.body.last_name}, </p>
<p></p>
<p>${req.body.message}</p>
<p>Click the link below to start your quiz.</p>
<p></p>

<li>Production Quiz: https://software-programming-quiz.herokuapp.com/start_quiz?id=${id}</li>
</ul>
`;
    // create reusable transporter object using the default SMTP transport
    let transporter = await nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.PASSWORD,
      },
      tls:{
          rejectUnauthorized:false
      }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Donnyves Laroque" <softprogramquiz@outlook.com>', // sender address
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
    try {
      let id = req.query.id;
      const questions = await Question.find({ quiz: id });
      const quiz = await Quiz.findById(id);
      res.render("quiz", {
        login_name: req.user.login_name,
        questions: questions,
        id: id,
        quiz: quiz,
      });
    } catch (error) {
      console.log(error);
      res.redirect("404");
    }
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
        timer: req.body.timer,
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
    try {
      let id = req.query.id;
      const quiz = await Quiz.findById(id);
      if (quiz ==  null) throw "does not exist";
      res.render("delete_quiz", {
        id: id,
        login_name: req.user.login_name,
        quiz: quiz,
      });
    } catch (error) {
      console.log(error);
      res.redirect("404");
    }
  });

// Aaron
exports.delete_quiz =
  ("/delete_question",
  checkAuthenticated,
  async (req, res) => {
    try {
      await Quiz.findByIdAndDelete(req.body.id);
      await Question.deleteMany({quiz: req.body.id});
      await Quiz_Instance.deleteMany({quiz: req.body.id});
      res.redirect("quizzes");
    } catch (error) {
      console.log(error);
      res.redirect("404");
    }
  });

// Aaron
exports.get_edit_quiz =
  (checkAuthenticated,
  async (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    try {
      let id = req.query.id;
      let quiz = await Quiz.findById(id);
      res.render("edit_quiz", {
        id: id,
        login_name: req.user.login_name,
        quiz: quiz,
      });
    } catch (error) {
      console.log(error);
      res.redirect("404");
    }
  });

// Aaron
exports.post_edit_quiz =
  ("/edit_quiz",
  checkAuthenticated,
  async (req, res) => {
    try {
      Quiz.findByIdAndUpdate(req.body.quiz, {
        name: req.body.name,
        timer: req.body.timer,
      }).then(() => {
        res.redirect("/quiz?id=" + req.body.quiz);
      });
    } catch (error) {
      console.log(error);
      res.redirect("/");
    }
  });

// Aaron/Donnyves
exports.get_quiz_results =
  (checkAuthenticated,
  async (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    try {
      let id = req.user.id;
      const quiz_instance = await Quiz_Instance.find({employer: req.user.id}).sort({
        grade:-1
      })

      let quiz_names = {};
      for (let i = 0; i < quiz_instance.length; i++) {
        let quiz_id = quiz_instance[i].quiz;
        if (!(quiz_id in quiz_names)) {
          let curr_quiz = await Quiz.findById(quiz_id);
          quiz_names[quiz_id] = curr_quiz.name;
        }
      };
      //==========================================

      res.render("quiz_results", {
        id: id,
        // =============================
        login_name: req.user.login_name,
        quiz_instance: quiz_instance,
        quiz_names: quiz_names
      });
    } catch (error) {
      console.log(error);
      res.redirect("404");
    }
  });

// Aaron
exports.create_question =
  (checkAuthenticated,
  (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    try {
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
    } catch (error) {
      console.log(error);
      res.redirect("404");
    }
  });

// Aaron
exports.post_create_question =
  ("/create_question",
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
    try {
      let id = req.query.id;
      const question = await Question.findById(id);
      res.render("question", {
        id: id,
        login_name: req.user.login_name,
        question: question,
      });
    } catch (error) {
      console.log(error);
      res.redirect("404");
    }
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
    try {
      let id = req.query.id;
      const question = await Question.findById(id);
      if (question == null) throw "does not exist";
      res.render("delete_question", {
        id: id,
        login_name: req.user.login_name,
        question: question,
      });
    } catch (error) {
      console.log(error);
      res.redirect("404");
    }
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

// Aaron
exports.quiz_stats =
  (checkAuthenticated,
  async (req, res) => {
    try {
      let candidate = await Quiz_Instance.find({quiz: req.query.id}).sort({grade: -1});
      let quiz = await Quiz.findById(req.query.id);
      res.render("quiz_stats", {
        candidate: candidate,
        quiz: quiz,
        login_name: req.user.login_name
      });
    } catch (error) {
      console.log(error);
      res.redirect("404");
    }
  });

// Aaron
exports.candidate_stats =
  (checkAuthenticated,
  async (req, res) => {
    try {
      let candidate = await Quiz_Instance.findById(req.query.id);
      let quiz = await Quiz.findById(candidate.quiz);
      let employer = await User.findById(candidate.employer);
      res.render("candidate_stats", {
        candidate: candidate,
        quiz: quiz,
        employer: employer,
        login_name: req.user.login_name
      });
    } catch (error) {
      console.log(error);
      res.redirect("404");
    }
  });

//Dominique/Aaron/Donnyves
exports.canidate_quiz =
  (checkAuthenticated,
  async (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    try {
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
    } catch (error) {
      console.log(error);
      res.redirect("404");
    }
  });
//Dominique/Donnyves
exports.canidate_survey = async (req, res) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  try {
    let id = req.query.id;
    const quiz_instance = await Quiz_Instance.findById(id);
    const quiz = await Quiz.findById(quiz_instance.quiz);
    const users = await User.findById(quiz_instance.employer);

    res.render("candidate_survey", {
      id: id,
      quiz: quiz,
      quiz_instance: quiz_instance,
      users: users,
    });
  } catch (error) {
    console.log(error);
    res.redirect("404");
  }
};

//Donnyves
exports.get_candidate_complete = async (req, res) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  try {
    let id = req.query.id;
    const quiz_instance = await Quiz_Instance.findById(id);
    const quiz = await Quiz.findById(quiz_instance.quiz);
    const users = await User.findById(quiz_instance.employer);

    res.render("candidate_complete", {
      id: id,
      quiz: quiz,
      quiz_instance: quiz_instance,
      users: users,
    });
  } catch (error) {
    console.log(error);
    res.redirect("404");
  }
};
//Dominique/Donnyves
exports.homeRoutes1 = (req, res) => {
  axios
    .get("http://localhost:3005/api/users")
    .then(function (response) {
      // MAYBE RENDER quiz_results or survey_results?
      res.render("candidate_index", { users: response.data });
    })
    .catch((err) => {
      res.send(err);
    });
};

exports.add_survey = (req, res) => {
  res.render("add_survey");
};

exports.update_user =
  (checkAuthenticated,
  (req, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");

    res.render("update_user", { user: userdata.data });
  });

//Dominique/Aaron
exports.candidate_survey_complete =
(checkAuthenticated,
(req, res) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");

  res.render("candidate_survey_complete", {  });
});