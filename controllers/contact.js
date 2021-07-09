const wrapAsync = require("../ultils/wrapAsync");
const nodemailer = require("nodemailer");
const multiparty = require("multiparty");
const email = process.env.EMAIL;
const pass = process.env.PASS;

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587 || 2525,
    auth: {
      user: email,
      pass: pass
    },
  });
  
  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log("Server is ready to take our messages");
    }
  });

module.exports.sendEmail = wrapAsync(async (req, res) => {
  //1.
  let form = new multiparty.Form();
  let data = {};
  form.parse(req, function (err, fields) {
    console.log(fields);
    Object.keys(fields).forEach(function (property) {
      data[property] = fields[property].toString();
    });

    //2. You can configure the object however you want
    const mail = {
      from: data.name,
      to: process.env.EMAIL,
      subject: "Message from Adora Finance user",
      text: `Name: ${data.name} \nEmail: ${data.email} \nMessage: ${data.message}`,
    };

    //3.
    await transporter.sendMail(mail, (err, data) => {
      if (err) {
        console.log(err);
        res.status(500).send("Something went wrong.");
      } else {
        res.status(200).send("Email successfully sent to recipient!");
      }
    });
  });
});
