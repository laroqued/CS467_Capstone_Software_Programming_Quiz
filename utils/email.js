require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
const app = express();

// app.use(express.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, "public")));

async function mainMail() {
  
  // ========================================================================
  // EMAIL THE BACK TO EMPLOYER
  // ========================================================================
  const output = `
<p>Result from Quiz Instance ${req.body.id} </p>
<ul>
<li>Name: Donnyves Laroque, Dominique Lazaros, Aaron Harris </li>

<li>Email: ${req.body.email}</li>
<li>Phone: 555-555-5555</li>
<h3>Message </h3>
<p>Hello ${req.body.login_name} </p>
<p></p>
<p>${req.body.message}</p>
<p>Click the link below to start your quiz.</p>
<p></p>
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
    from: `"Donnyves Laroque" <${req.body.email}>`, // sender address
    to: req.body.owner, // list of receivers (emails)
    subject: `${req.body.quiz_name}  Quiz Instance ID ${req.body.id}`, // Subject line
    text: "Hello world?", // plain text body
    html: output, // html body
  });
  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log("Mail server is running...");
      res.render("candidate_survey", {
        login_name: req.user.login_name,
      });
      console.log(`Message sent: ${info.messageId}`);
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    console.log(body);
  });
  // ========================================================================
  // EMAIL BACK TO THE EMPLOYER END
  // ========================================================================
}


module.exports = {
mainMail
};