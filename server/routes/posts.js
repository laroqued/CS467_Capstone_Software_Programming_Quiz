const router = require("express").Router();
const User = require("../model/User");
const verify = require('./verifyToken')

router.get("/",verify, (req, res) => {
  res.send(req.user) // This will provide the "iat" number that coincides with you token


  // res.json({
  //   posts: {
  //     title: "my first post",
  //     description: "random data you should not access",
  //   },
  // });


});

module.exports = router;
