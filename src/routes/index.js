const express = require("express");
const router = express.Router();
const controller = require("../controller/controller");



let routes = (app) => {

    //  router.get("/yourRoute", controller.addfunctionHere);

    app.use(router);
};

module.exports = routes;