dotenv = require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const flash = require("express-flash");
const session = require("express-session");
const passport = require("passport");
const methodOverride = require("method-override");


const uuid = require("uuid");
const bcrypt = require("bcrypt");
const UserService = require("./src/user");

//require('./src/config/passport');
require("./src/config/local");
require("./src/config/google");


// Create a .env file to use process.env
let port = process.env.PORT;
let host = process.env.HOST;

// EJS initialization
app.set("view engine", "ejs");

// Static page
app.use(express.static("public"));

// JSON Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ===========================================================================================
/*
The express-flash module exposes getter and setter methods for a flash message of the form, { flash: { type: 'type', message: 'message' }} and depends on the express-session module. The method req. flash(type, message) sets the value of a new flash message and adds it to an array of messages of the same type 
 */
// ===========================================================================================
app.use(flash());

// ===========================================================================================
/* 
Express-session - an HTTP server-side framework used to create and manage a session middleware. This tutorial is all about sessions. Thus Express-session library will be the main focus. Cookie-parser - used to parse cookie header to store data on the browser whenever a session is established on the server-side
*/
// ===========================================================================================
app.use(
  session({
    secret: process.env.TOKEN_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// ===========================================================================================
/* 
Passport is authentication middleware for Node. js. As it's extremely flexible and modular, Passport can be unobtrusively dropped into any Express-based web application. A comprehensive set of strategies supports authentication using a username and password, Facebook, Twitter, and more.
*/
// ===========================================================================================

app.use(passport.initialize());
app.use(passport.session());

// ===========================================================================================
/* 
Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it.
*/
// ===========================================================================================
app.use(methodOverride("_method"));

// // Cross Origin Whitelist
// const cors = require("cors");
// const allowedOrigins = [
//   `http//:${host}:${port}`,
//   "https://cloud.mongodb.com",
// ];
// app.use(
//     cors({
//         origin: function(origin, callback) {
//             if (!origin) return callback(null, true);
//             if (allowedOrigins.indexOf(origin) === -1) {
//                 var msg =
//                     "The CORS policy for this site does not " +
//                     "allow access from the specified Origin.";
//                 return callback(new Error(msg), false);
//             }
//             return callback(null, true);
//         },
//     })
// );
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   next();
// });
//==============================================================
//==============================================================

// Global base directory for file downloads
global.__basedir = __dirname;

// app.use(express.urlencoded({ extended: false }));
// app.use(express.json());

/* 
morgan is a Node. js and Express middleware to log HTTP requests and errors, and simplifies the process. In Node. js and Express, middleware is a function that has access to the request and response lifecycle methods, and the next() method to continue logic in your Express server.
*/
app.use(morgan("tiny"));

// Route setup
const path = require("path");

// //======================================================================
// // Possible JWT routes to implement later?
// //======================================================================
// // Import routes
// const authRoute = require('./server/middlewares/auth')
// const postRoute = require('./server/routes/posts')

// // Route Middleware (/api/user is prefixed for the auth.js routes)
// app.use('/api/user', authRoute)
// app.use('/api/posts', postRoute)


// //======================================================================
// //======================================================================

app.use(require("./server/routes/router"));

// //======================================================================
// //======================================================================

const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("./server/middlewares/auth");
app.use(methodOverride("_method"));

app.get("/", checkAuthenticated, (req, res) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.render("index", { name: req.user.name });
});

app.delete("/logout", checkAuthenticated, async (req, res) => {
  await req.logOut();
  if (!req.user)
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.redirect("/login");
});

// ================================================================================
// GOOGLE
// ================================================================================

const isLoggedIn = (req, res, next) => {
  req.user ? next() : res.sendStatus(401);
};

app.get("/g", (req, res) => {
  res.render("google.ejs");
});

app.get("/home", (req, res) => {
  res.render("home.ejs");
});

app.get("/local/signup", (req, res) => {
  res.render("local/signup.ejs");
});

app.get("/local/signin", (req, res) => {
  res.render("local/signin.ejs");
});

app.get("/profile", isLoggedIn, (req, res) => {
  res.render("profile.ejs", { user: req.user });
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/g",
    successRedirect: "/profile",
    failureFlash: true,
    successFlash: "Successfully logged in!",
  })
);

app.get("/auth/logout", (req, res) => {
  req.flash("success", "Successfully logged out");
  req.session.destroy(function () {
    res.clearCookie("connect.sid");
    res.redirect("/home");
  });
});

app.post("/auth/local/signup", async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  if (password.length < 8) {
    req.flash(
      "error",
      "Account not created. Password must be 7+ characters long"
    );
    return res.redirect("/local/signup");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await UserService.addLocalUser({
      id: uuid.v4(),
      email,
      firstName: first_name,
      lastName: last_name,
      password: hashedPassword,
    });
  } catch (e) {
    req.flash(
      "error",
      "Error creating a new account. Try a different login method."
    );
    res.redirect("/local/signup");
  }

  res.redirect("/local/signin");
});

app.post(
  "/auth/local/signin",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/local/signin",
    failureFlash: true,
  })
);

// ================================================================================
// GOOGLE END
// ================================================================================


// connect to database
const connectDB = require("./server/database/connection");
// mongoDB conncection
connectDB();

// Error page
app.use(function (req, res) {
  res.status(404);
  res.render("404");
});

// Error page
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.type("plain/text");
  res.status(500);
  res.render("500");
});

app.listen(port, host, () => {
  console.log(
    `Express started \on http//:${host}:${port} press Ctrl-C to terminate.`
  );
});
// Handling Error
process.on("unhandledRejection", (err) => {
  console.log(`An error occurred: ${err.message}`);
  server.close(() => process.exit(1));
});
