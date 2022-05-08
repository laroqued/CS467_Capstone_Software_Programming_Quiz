require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");

const path = require("path");

const app = express();

// app.use(express.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, "public")));

async function mainMail(name, company, email, phone, message) {
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
  let transporter = nodemailer.createTransport({
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
  let info = transporter.sendMail({
    from: '"Donnyves Laroque" <softwareprogrammingquiz@gmail.com>', // sender address
    to: "donnyves.laroque@outlook.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: output, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

  // Rerender if there is an error
  res.render("contact", { msg: "Email has been sent" });

}


module.exports = {
mainMail
};