const router = require("express").Router();
const User = require("../model/User");
const jwt = require("jsonwebtoken");
const { registerValidation, loginValidation } = require("../../validation");
const bcrypt = require("bcryptjs");

// Routes
router.post("/register", async (req, res) => {
  console.log(req.body);
  //res.send('Register (This is a test message for Postman)')// send post test message 'Register'
  const { error } = registerValidation(req.body);
  // LETS VALIDATE THE DATA BEFORE SUBMITTING
  if (error) return res.status(400).send(error.details[0].message);

  // Check if the user is already in the database
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("Email already exists");

  // use bcrypt to hash the password
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  // Create a new User
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashPassword, // use hashPassword instead of req.body.password
  });

  // Save after post request
  try {
    const savedUser = await user.save();
    // Instead of return the id with all the properties, return ID only
    res.send({ user: user._id });
  } catch (err) {
    res.status(400).send(err);
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { error } = loginValidation(req.body);

  // LETS VALIDATE THE DATA BEFORE SUBMITTING
  if (error) return res.status(400).send(error.details[0].message);

  // Checking if the email exists
  const user = await User.findOne({ email: req.body.email });

  // Checking if the email exist, if not there will be an error
  if (!user) return res.status(400).send("Email or password is wrong");

  // Check if the password is correct
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send("Password is not found");

  // Assign a json web token (JWT)
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);

  res.header("auth-token", token).send(token);
  console.log(`JWT Token: ${token}`);
});

module.exports = router;
