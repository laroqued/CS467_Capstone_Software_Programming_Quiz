dotenv = require("dotenv").config();
const axios = require("axios");
const express = require("express");
const app = express();
const morgan = require("morgan");


// JSON Encoding
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Global base directory for file downloads
global.__basedir = __dirname;

// EJS initialization
app.set("view engine", "ejs");

// Route setup
const path = require("path");
app.use("/", require("./server/routes/router"));


// // Import routes
// const authRoute = require('./server/routes/auth')
// const postRoute = require('./server/routes/posts')

// // Route Middleware (/api/user is prefixed for the auth.js routes)
// app.use('/api/user', authRoute)
// app.use('/api/posts', postRoute)




// log requests
app.use(morgan('tiny'))

// connect to database
const connectDB = require("./server/database/connection");
// mongoDB conncection
connectDB();


app.use(express.urlencoded({ extended: false }));
app.use(express.json());




app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});


// Cross Origin Whitelist
const cors = require("cors");
const allowedOrigins = [
    "http://localhost:3001",

];
app.use(
    cors({
        origin: function(origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) === -1) {
                var msg =
                    "The CORS policy for this site does not " +
                    "allow access from the specified Origin.";
                return callback(new Error(msg), false);
            }
            return callback(null, true);
        },
    })
);

// Static page
app.use(express.static("public"));






// Error page
app.use(function(req, res) {
    res.status(404);
    res.render("404");
});

// Error page
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.type("plain/text");
    res.status(500);
    res.render("500");
});


// Create a .env file to use process.env
let port = process.env.PORT; // OR let port = '3001'
let host = process.env.HOST;
// let host = 'localhost'
// let port = '3001'
app.listen(port, host, () => {
    console.log(
        `Express started \on http//:${host}:${port} press Ctrl-C to terminate.`
    );
});