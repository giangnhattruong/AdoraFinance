const express = require("express");
const router = express.Router();
const {
  renderHome,
  renderAbout,
  renderContactForm,
  sendEmail,
} = require("../controllers/main.js");
const { validateContact } = require("../middleware");

router.get("/", renderHome);

router.get("/about", renderAbout);

router
  .route("/contact")
  .get(renderContactForm)
  .post(validateContact, sendEmail);

module.exports = router;
