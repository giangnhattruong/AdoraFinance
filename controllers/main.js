const nodemailer = require("nodemailer");
const myEmail = process.env.EMAIL;
const myPass = process.env.PASS;

module.exports.renderHome = (req, res) => {
  res.render("home");
};

module.exports.renderAbout = (req, res) => {
  res.render("about");
};

module.exports.renderContactForm = (req, res) => {
  res.render("contact");
};

module.exports.sendEmail = (req, res) => {
    const { name, email, message } = req.body.contact;
    const smtpTrans = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: myEmail,
        pass: myPass,
      },
    });
    const mailOpts = {
      from: "Me", // This is ignored by Gmail
      to: "it@adora.finance",
      subject: "New message from Adora contact",
      text: `${name} (${email}) says: ${message}`,
    };
    smtpTrans.sendMail(mailOpts, (error, response) => {
      if (error) {
        req.flash("error", "Something went wrong."); // Show a page indicating failure
      } else {
        req.flash("success", "Successfully sent your message!"); // Show a page indicating success
      }
      res.redirect("/contact");
    });
  }